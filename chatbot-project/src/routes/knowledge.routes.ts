import { Router } from "express";
import { testDbController } from "../controllers/knowledge.controller";

const knowledgeRouter = Router();

knowledgeRouter.get("/test-db", testDbController);

export default knowledgeRouter;
