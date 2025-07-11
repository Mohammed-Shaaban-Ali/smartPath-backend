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
exports.getSingleTrack = exports.getAllTracks = exports.deleteTrack = exports.updateTrack = exports.createTrack = exports.getTrackById = exports.getTracksForSelect = exports.getTracks = void 0;
const Track_1 = __importDefault(require("../models/Track"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const app_error_util_1 = __importDefault(require("../utils/app-error.util"));
const format_res_util_1 = __importDefault(require("../utils/format-res.util"));
const async_handler_util_1 = __importDefault(require("../utils/async-handler.util"));
const paginate_1 = require("../utils/paginate");
const Roadmap_1 = __importDefault(require("../models/Roadmap"));
/**
 * Get all tracks
 */
exports.getTracks = (0, async_handler_util_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const search = req.query.search || "";
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const query = search
        ? {
            title: { $regex: search, $options: "i" },
        }
        : {};
    const tracks = yield Track_1.default.find(query).select("title icon _id");
    const paginated = (0, paginate_1.paginateArray)(tracks, page, limit);
    res.status(200).json((0, format_res_util_1.default)("Tracks fetched successfully", paginated));
}));
/**
 * Get all tracks for sselect return id and title
 */
exports.getTracksForSelect = (0, async_handler_util_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tracks = yield Track_1.default.find().select("title _id");
    res.status(200).json((0, format_res_util_1.default)("Tracks fetched successfully", { tracks }));
}));
/**
 * Get track by ID
 */
exports.getTrackById = (0, async_handler_util_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const track = yield Track_1.default.findById(req.params.id);
    if (!track)
        throw new app_error_util_1.default("Track not found", 404);
    const roadmapswithThisTrack = yield Roadmap_1.default.find({
        track: req.params.id,
    }).select("title icon link _id");
    res.status(200).json((0, format_res_util_1.default)("Track fetched successfully", {
        track,
        roadmaps: roadmapswithThisTrack,
    }));
}));
/**
 * Create a new track with Cloudinary icon uploads
 */
exports.createTrack = (0, async_handler_util_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, body } = req.body;
    if (!title || !body)
        throw new app_error_util_1.default("Title and body are required", 400);
    let iconUrl = "";
    if (req.files) {
        const files = req.files;
        if (files.icon) {
            const result = yield cloudinary_1.default.uploader.upload(files.icon[0].path, {
                folder: "tracks",
                resource_type: "image",
            });
            iconUrl = result.secure_url;
        }
    }
    const track = yield Track_1.default.create({
        title,
        icon: iconUrl,
        body,
    });
    res.status(201).json((0, format_res_util_1.default)("Track created successfully", { track }));
}));
/**
 * Update track by ID
 */
exports.updateTrack = (0, async_handler_util_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, body } = req.body;
    let updateData = { title, body };
    if (req.files) {
        const files = req.files;
        if (files.icon) {
            const result = yield cloudinary_1.default.uploader.upload(files.icon[0].path, {
                folder: "tracks",
                resource_type: "image",
            });
            updateData.icon = result.secure_url;
        }
    }
    const track = yield Track_1.default.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
    });
    if (!track)
        throw new app_error_util_1.default("Track not found", 404);
    res.status(200).json((0, format_res_util_1.default)("Track updated successfully", { track }));
}));
/**
 * Delete track by ID
 */
exports.deleteTrack = (0, async_handler_util_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const track = yield Track_1.default.findByIdAndDelete(req.params.id);
    if (!track)
        throw new app_error_util_1.default("Track not found", 404);
    res.status(200).json((0, format_res_util_1.default)("Track deleted successfully"));
}));
/**
 * ------------Dashboard Controller------------
 */
// get all tracks for dashboard
exports.getAllTracks = (0, async_handler_util_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const tracks = yield Track_1.default.find();
    const paginatedTracks = (0, paginate_1.paginateArray)(tracks, page, limit);
    res
        .status(200)
        .json((0, format_res_util_1.default)("Tracks fetched successfully", paginatedTracks));
}));
// get single track for dashboard
exports.getSingleTrack = (0, async_handler_util_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const track = yield Track_1.default.findById(req.params.id);
    if (!track)
        throw new app_error_util_1.default("Track not found", 404);
    res.status(200).json((0, format_res_util_1.default)("Track fetched successfully", track));
}));
