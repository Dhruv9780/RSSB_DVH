export type AppUser = {
  id: number;
  username: string;
  fullName?: string;
  role: 'SECURITY_SEWADAR' | 'SUPER_ADMIN';
};

export type LoginResponse = {
  accessToken: string;
  user: AppUser;
};

export type Category = {
  id: number;
  name: string;
};

export type Location = {
  id: number;
  name: string;
};

export type FoundItem = {
  id: number;
  itemCode: string;
  itemName: string;
  description?: string | null;
  brand?: string | null;
  color?: string | null;
  status: 'STORED' | 'CLAIMED' | 'RETURNED' | 'ARCHIVED';
  createdAt: string;
  category: Category;
  locationFound: Location;
  images?: FoundItemImage[];
};

export type FoundItemImage = {
  id: number;
  path: string;
  filename: string;
};

export type LostReport = {
  id: number;
  reportCode: string;
  personName: string;
  phoneNumber: string;
  itemName: string;
  description?: string | null;
  brand?: string | null;
  color?: string | null;
  status: 'OPEN' | 'MATCHED' | 'RETURNED' | 'CLOSED';
  createdAt: string;
  photoPath?: string | null;
  category?: Category | null;
  locationLost?: Location | null;
};

export type MatchingSuggestion = {
  foundItem: FoundItem;
  confidence: number;
};

export type GlobalSearchResult = {
  foundItems: FoundItem[];
  lostReports: LostReport[];
  pagination: {
    page: number;
    pageSize: number;
    foundTotal: number;
    foundTotalPages: number;
    lostTotal: number;
    lostTotalPages: number;
  };
};

export type IncidentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type Incident = {
  id: number;
  incidentCode: string;
  title: string;
  description?: string | null;
  priority: IncidentPriority;
  location: string;
  incidentAt: string;
  reporterName: string;
  reporterContact: string;
  status: IncidentStatus;
  createdAt: string;
  category?: Category | null;
  createdBy?: {
    id: number;
    username: string;
    fullName: string;
  };
};
