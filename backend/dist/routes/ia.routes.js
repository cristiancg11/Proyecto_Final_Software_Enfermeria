"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iaRouter = void 0;
const express_1 = require("express");
const ia_controller_1 = require("../controllers/ia.controller");
exports.iaRouter = (0, express_1.Router)();
// GET /api/ia/ranking-progreso
exports.iaRouter.get('/ranking-progreso', ia_controller_1.obtenerRankingProgresoIA);
// GET y POST para el Modo "Trivia Reto Extremo" con ranking competitivo en tiempo real
exports.iaRouter.get('/reto-extremo/ranking', ia_controller_1.obtenerRankingRetoExtremo);
exports.iaRouter.post('/reto-extremo/registrar', ia_controller_1.registrarIntentoRetoExtremo);
