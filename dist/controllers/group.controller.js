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
exports.deleteGroup = exports.getGroupById = exports.getAllGroups = exports.createGroup = void 0;
const Group_1 = __importDefault(require("../models/Group"));
const async_handler_util_1 = __importDefault(require("../utils/async-handler.util"));
const format_res_util_1 = __importDefault(require("../utils/format-res.util"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
// ✅ Create Group
exports.createGroup = (0, async_handler_util_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    const createdBy = req.userId;
    if (!name) {
        res.status(400).json((0, format_res_util_1.default)("Group name is required."));
        return;
    }
    const existingGroup = yield Group_1.default.findOne({ name });
    if (existingGroup) {
        res.status(400).json((0, format_res_util_1.default)("Group name already exists."));
        return;
    }
    let imageUrl = null;
    if (req.file) {
        const result = yield cloudinary_1.default.uploader.upload(req.file.path, {
            folder: "groups",
            resource_type: "image",
        });
        imageUrl = result.secure_url;
    }
    const newGroup = yield Group_1.default.create({
        name,
        image: imageUrl,
        createdBy,
    });
    res
        .status(201)
        .json((0, format_res_util_1.default)("Group created successfully.", { group: newGroup }));
}));
// ✅ Get All Groups
exports.getAllGroups = (0, async_handler_util_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const groups = yield Group_1.default.find()
        .populate("createdBy", "name avatar")
        .sort({ createdAt: -1 });
    const formattedGroups = groups.map((group) => ({
        _id: group._id,
        name: group.name,
        image: group.image,
        createdBy: group.createdBy,
        createdAt: group.createdAt,
    }));
    res
        .status(200)
        .json((0, format_res_util_1.default)("Groups fetched successfully.", { groups: formattedGroups }));
}));
// ✅ Get Group by Id
exports.getGroupById = (0, async_handler_util_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupId } = req.params;
    const group = yield Group_1.default.findById(groupId);
    if (!group) {
        res.status(404).json((0, format_res_util_1.default)("Group not found."));
        return;
    }
    res.status(200).json((0, format_res_util_1.default)("Group fetched successfully.", { group }));
}));
// ✅ Delete Group
exports.deleteGroup = (0, async_handler_util_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupId } = req.params;
    const group = yield Group_1.default.findById(groupId);
    if (!group) {
        res.status(404).json((0, format_res_util_1.default)("Group not found."));
        return;
    }
    // Optional: ممكن تخليه اللي أنشأه بس يقدر يمسحه
    if (group.createdBy.toString() !== req.userId) {
        res.status(403).json((0, format_res_util_1.default)("Not authorized to delete this group."));
        return;
    }
    yield group.deleteOne();
    res.status(200).json((0, format_res_util_1.default)("Group deleted successfully."));
}));
