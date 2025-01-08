var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { db } from '../src/lib/server/database/db.js';
import { objects } from '../src/lib/server/database/schema.js';
import { generateRandomColor, transportToObject } from '../src/lib/utils/index.js';
import { eq } from 'drizzle-orm';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';
import { setBoard } from './db.js';
import { authMiddleware } from './middleware/auth.js';
import { originMiddleware } from './middleware/origin.js';
var app = express();
var server = createServer(app);
var io = new Server(server, {
    cors: {
        origin: process.env.APP_URL,
        methods: ['GET', 'POST'],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
});
var activeCollaborators = new Map();
var activeBoards = new Map();
io.use(originMiddleware);
io.use(authMiddleware);
io.on('connection', function (socket) { return __awaiter(void 0, void 0, void 0, function () {
    var boardId, user, boardModel, usedColors, collaborator, boardObjects, err_1;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                boardId = socket.handshake.auth.boardId;
                user = socket.data.user;
                boardModel = socket.data.boardModel;
                if (!activeCollaborators.has(boardId)) {
                    activeCollaborators.set(boardId, []);
                }
                usedColors = activeCollaborators.get(boardId).map(function (c) { return c.color; });
                collaborator = {
                    id: socket.id,
                    name: (_a = user === null || user === void 0 ? void 0 : user.name) !== null && _a !== void 0 ? _a : uniqueNamesGenerator({
                        dictionaries: [adjectives, animals],
                        separator: ' ',
                        style: 'capital'
                    }),
                    picture: (_b = user === null || user === void 0 ? void 0 : user.picture) !== null && _b !== void 0 ? _b : '',
                    userId: user === null || user === void 0 ? void 0 : user.id,
                    cursor: { x: 0, y: 0 },
                    color: generateRandomColor(usedColors),
                    objectsSelected: [],
                    objectsSelectedBox: {
                        pos: { x: 0, y: 0 },
                        width: 0,
                        height: 0,
                        rotation: 0
                    },
                    lastActive: new Date()
                };
                if (!!activeBoards.has(boardId)) return [3 /*break*/, 4];
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                return [4 /*yield*/, db
                        .select()
                        .from(objects)
                        .where(eq(objects.boardId, boardId))
                        .orderBy(objects.zIndex)];
            case 2:
                boardObjects = _c.sent();
                activeBoards.set(boardId, __assign(__assign({}, boardModel), { objects: boardObjects }));
                return [3 /*break*/, 4];
            case 3:
                err_1 = _c.sent();
                console.error('Failed to get board objects:', err_1);
                return [3 /*break*/, 4];
            case 4:
                socket.emit('connect_init', collaborator, activeCollaborators.get(boardId), activeBoards.get(boardId));
                socket.broadcast.to(boardId).emit('user_join', collaborator);
                activeCollaborators.get(boardId).push(collaborator);
                console.log('Client connected:', socket.id);
                socket.on('update_board', function (updates) {
                    socket.broadcast.to(boardId).emit('board_updated', updates);
                    var currBoard = activeBoards.get(boardId);
                    activeBoards.set(boardId, __assign(__assign({}, currBoard), updates));
                });
                socket.on('update_collaborator', function (updates, id) {
                    socket.broadcast.to(boardId).emit('collaborator_updated', updates, id);
                });
                socket.on('update_objects', function (transportObjects) { return __awaiter(void 0, void 0, void 0, function () {
                    var newObjects, currBoard, updatedObjects;
                    return __generator(this, function (_a) {
                        socket.broadcast.to(boardId).emit('objects_updated', transportObjects);
                        newObjects = transportObjects.map(function (transportObject) {
                            return transportToObject(transportObject);
                        });
                        currBoard = activeBoards.get(boardId);
                        updatedObjects = __spreadArray([], currBoard.objects, true);
                        newObjects.forEach(function (object) {
                            var index = updatedObjects.findIndex(function (o) { return o.id === object.id; });
                            if (index !== -1) {
                                updatedObjects[index] = object;
                            }
                            else {
                                updatedObjects.push(object);
                            }
                        });
                        activeBoards.set(boardId, __assign(__assign({}, currBoard), { objects: updatedObjects }));
                        return [2 /*return*/];
                    });
                }); });
                socket.on('delete_objects', function (objectIds) {
                    socket.broadcast.to(boardId).emit('objects_deleted', objectIds);
                    var currBoard = activeBoards.get(boardId);
                    activeBoards.set(boardId, __assign(__assign({}, currBoard), { objects: currBoard.objects.filter(function (object) { return !objectIds.includes(object.id); }) }));
                });
                socket.on('update_temp_objects', function (transportObjects) {
                    socket.broadcast.to(boardId).emit('temp_objects_updated', transportObjects);
                });
                socket.on('delete_temp_objects', function (objectIds) {
                    socket.broadcast.to(boardId).emit('temp_objects_deleted', objectIds);
                });
                socket.on('disconnect', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var board;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                console.log('Client disconnected:', socket.id);
                                activeCollaborators.set(boardId, (activeCollaborators.get(boardId) || []).filter(function (c) { return c.id !== socket.id; }));
                                socket.broadcast.to(boardId).emit('user_leave', socket.id);
                                if (!(activeCollaborators.get(boardId).length === 0)) return [3 /*break*/, 2];
                                activeCollaborators.delete(boardId);
                                board = activeBoards.get(boardId);
                                return [4 /*yield*/, setBoard(board)];
                            case 1:
                                _a.sent();
                                activeBoards.delete(boardId);
                                _a.label = 2;
                            case 2: return [2 /*return*/];
                        }
                    });
                }); });
                socket.on('error', function (error) {
                    console.error('Socket error:', error);
                });
                return [2 /*return*/];
        }
    });
}); });
app.use(cors());
app.use(express.json());
var PORT = 3001;
server.listen(PORT, function () {
    console.log("Server running on port ".concat(PORT));
});
export { server, io };
//# sourceMappingURL=index.js.map