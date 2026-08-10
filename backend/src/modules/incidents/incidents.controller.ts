import type { Request, Response } from 'express';

import { HttpError } from '../../utils/http-error.js';
import { activityService } from '../activity/activity.service.js';

import type { ListIncidentsQuery } from './incidents.dto.js';
import { incidentsService } from './incidents.service.js';

export const incidentsController = {
  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new HttpError('Unauthorized', 401);
    }

    const incident = await incidentsService.create(req.body, req.user.id);

    await activityService.logActivity({
      userId: req.user.id,
      action: 'INCIDENT_CREATE',
      entity: 'Incident',
      entityId: String(incident.id),
      metadata: {
        incidentCode: incident.incidentCode,
        priority: incident.priority,
        status: incident.status,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });

    res.status(201).json({ incident });
  },

  async list(req: Request, res: Response): Promise<void> {
    const result = await incidentsService.list(req.query as unknown as ListIncidentsQuery);
    res.status(200).json(result);
  },

  async updateStatus(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new HttpError('Unauthorized', 401);
    }

    const incidentId = Number(req.params.id);
    const incident = await incidentsService.updateStatus(incidentId, req.body);

    if (!incident) {
      throw new HttpError('Incident not found', 404);
    }

    await activityService.logActivity({
      userId: req.user.id,
      action: 'INCIDENT_STATUS_UPDATE',
      entity: 'Incident',
      entityId: String(incident.id),
      metadata: {
        incidentCode: incident.incidentCode,
        status: incident.status,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });

    res.status(200).json({ incident });
  },
};
