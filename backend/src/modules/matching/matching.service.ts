import { prisma } from '../../lib/prisma.js';

type LostInput = {
  itemName: string;
  categoryId?: number | null;
  brand?: string | null;
  color?: string | null;
  description?: string | null;
};

const normalizeText = (value?: string | null): string => {
  return (value ?? '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
};

const tokenize = (value?: string | null): Set<string> => {
  const normalized = normalizeText(value);
  if (!normalized) {
    return new Set<string>();
  }
  return new Set(normalized.split(' '));
};

const overlapScore = (left?: string | null, right?: string | null): number => {
  const leftTokens = tokenize(left);
  const rightTokens = tokenize(right);

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let overlap = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      overlap += 1;
    }
  }

  return overlap / Math.max(leftTokens.size, rightTokens.size);
};

const exactScore = (left?: string | null, right?: string | null): number => {
  if (!left || !right) {
    return 0;
  }

  return normalizeText(left) === normalizeText(right) ? 1 : 0;
};

const getConfidence = (lost: LostInput, found: LostInput): number => {
  const categoryScore = lost.categoryId && found.categoryId && lost.categoryId === found.categoryId ? 1 : 0;
  const brandScore = exactScore(lost.brand, found.brand);
  const colorScore = exactScore(lost.color, found.color);
  const itemScore = overlapScore(lost.itemName, found.itemName);
  const descriptionScore = overlapScore(lost.description, found.description);

  const weighted =
    categoryScore * 0.25 + brandScore * 0.15 + colorScore * 0.1 + itemScore * 0.3 + descriptionScore * 0.2;

  return Math.round(weighted * 100);
};

export const matchingService = {
  async suggestForLostData(lost: LostInput) {
    const candidates = await prisma.foundItem.findMany({
      where: {
        status: {
          in: ['STORED', 'CLAIMED'],
        },
      },
      include: {
        category: true,
        locationFound: true,
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 200,
    });

    const suggestions = candidates
      .map((candidate) => ({
        foundItem: candidate,
        confidence: getConfidence(lost, {
          itemName: candidate.itemName,
          categoryId: candidate.categoryId,
          brand: candidate.brand,
          color: candidate.color,
          description: candidate.description,
        }),
      }))
      .filter((entry) => entry.confidence >= 40)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);

    return suggestions;
  },

  async suggestForLostReport(lostReportId: number) {
    const report = await prisma.lostReport.findUnique({
      where: { id: lostReportId },
      select: {
        id: true,
        itemName: true,
        categoryId: true,
        brand: true,
        color: true,
        description: true,
      },
    });

    if (!report) {
      return null;
    }

    const suggestions = await this.suggestForLostData(report);

    return {
      report,
      suggestions,
    };
  },
};
