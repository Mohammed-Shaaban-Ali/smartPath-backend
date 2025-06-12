"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardController = void 0;
const format_res_util_1 = __importDefault(require("../utils/format-res.util"));
const models_1 = require("../models");
const Course_1 = __importDefault(require("../models/Course"));
const Message_1 = __importDefault(require("../models/Message"));
const Track_1 = __importDefault(require("../models/Track"));
const dashboard_service_1 = require("../services/dashboard.service");
const getDashboardController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield models_1.User.countDocuments();
        const courses = yield Course_1.default.countDocuments();
        const messages = yield Message_1.default.countDocuments();
        const tracks = yield Track_1.default.countDocuments();
        const userEnroolment = yield (0, dashboard_service_1.getAllUserWithUserEnrollMentIncourse)();
        const usersWithRoadmaps = yield (0, dashboard_service_1.getAllUsersAndUsersWithRoadmaps)();
        res.status(200).json((0, format_res_util_1.default)("dashboard fetched successfully", {
            counts: { users, courses, messages, tracks },
            UsersVSUsersEnrolled: userEnroolment,
            UsersVSUsersWithRoadmaps: usersWithRoadmaps,
        }));
    }
    catch (err) {
        next(err);
    }
});
exports.getDashboardController = getDashboardController;
