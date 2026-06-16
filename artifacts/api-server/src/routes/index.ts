import { Router, type IRouter } from "express";
import healthRouter from "./health";
import questionsRouter from "./questions";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(questionsRouter);
router.use(aiRouter);

export default router;
