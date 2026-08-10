import { Router } from 'express';

import { adminRouter } from '../modules/admin/admin.routes.js';
import { authRouter } from '../modules/auth/auth.routes.js';
import { catalogRouter } from '../modules/catalog/catalog.routes.js';
import { dashboardRouter } from '../modules/dashboard/dashboard.routes.js';
import { foundItemsRouter } from '../modules/found-items/found-items.routes.js';
import { healthRouter } from '../modules/health/health.routes.js';
import { incidentsRouter } from '../modules/incidents/incidents.routes.js';
import { lostReportsRouter } from '../modules/lost-reports/lost-reports.routes.js';
import { matchingRouter } from '../modules/matching/matching.routes.js';
import { returnsRouter } from '../modules/returns/returns.routes.js';
import { searchRouter } from '../modules/search/search.routes.js';

const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/catalog', catalogRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/found-items', foundItemsRouter);
apiRouter.use('/incidents', incidentsRouter);
apiRouter.use('/lost-reports', lostReportsRouter);
apiRouter.use('/matching', matchingRouter);
apiRouter.use('/returns', returnsRouter);
apiRouter.use('/search', searchRouter);

export { apiRouter };
