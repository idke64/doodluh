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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { io } from 'socket.io-client';
import { browser } from '$app/environment';
import { v4 as uuidv4 } from 'uuid';
import { objectToTransport, throttle, transportToObject } from '$lib/utils';
import { PUBLIC_SOCKET_URL } from '$env/static/public';
var defaultBoard = {
    id: uuidv4(),
    name: 'Untitled',
    visibility: 'private',
    createdAt: new Date(),
    updatedAt: new Date(),
    objects: [],
    backgroundColor: 'transparent',
    grid: 'none'
};
var defaultSelf = {
    id: '',
    name: '',
    picture: '',
    cursor: { x: 0, y: 0 },
    color: '',
    objectsSelected: [],
    objectsSelectedBox: {
        pos: { x: 0, y: 0 },
        width: 0,
        height: 0,
        rotation: 0
    },
    lastActive: new Date()
};
export function createRealtimeBoard(boardId) {
    var board = $state(__assign(__assign({}, defaultBoard), { id: boardId, loading: true, update: function (updates, emit) {
            if (emit === void 0) { emit = true; }
            Object.assign(this, __assign(__assign({}, updates), { updatedAt: new Date() }));
            if (emit && (socket === null || socket === void 0 ? void 0 : socket.connected)) {
                socket.emit('update_board', updates);
            }
        }, updateObjects: function (newObjects, emit) {
            if (emit === void 0) { emit = true; }
            var updatedObjects = __spreadArray([], this.objects, true);
            newObjects.forEach(function (obj) {
                var index = updatedObjects.findIndex(function (o) { return o.id === obj.id; });
                if (index !== -1) {
                    updatedObjects[index] = obj;
                }
                else {
                    updatedObjects.push(obj);
                }
            });
            this.objects = updatedObjects;
            this.updatedAt = new Date();
            if (emit && (socket === null || socket === void 0 ? void 0 : socket.connected)) {
                var transportObjects = newObjects.map(function (object) {
                    return objectToTransport(object);
                });
                socket.emit('update_objects', transportObjects);
            }
        }, deleteObjects: function (objectIds, emit) {
            if (emit === void 0) { emit = true; }
            this.objects = this.objects.filter(function (object) { return !objectIds.includes(object.id); });
            this.updatedAt = new Date();
            if (emit && (socket === null || socket === void 0 ? void 0 : socket.connected)) {
                socket.emit('delete_objects', objectIds);
            }
        }, clear: function () {
            this.update({ objects: [] });
        } }));
    var tempObjects = $state(__assign(__assign({}, []), { update: function (newObjects, emit) {
            if (emit === void 0) { emit = true; }
            var updatedObjects = __spreadArray([], this, true);
            newObjects.forEach(function (object) {
                var index = updatedObjects.findIndex(function (o) { return o.id === object.id; });
                if (index !== -1) {
                    updatedObjects[index] = object;
                }
                else {
                    updatedObjects.push(object);
                }
            });
            this.length = 0;
            this.push.apply(this, updatedObjects);
            if (emit && (socket === null || socket === void 0 ? void 0 : socket.connected)) {
                emitters.updateTempObjects(newObjects);
            }
        }, delete: function (objectIds, emit) {
            if (emit === void 0) { emit = true; }
            var filtered = __spreadArray([], this, true).filter(function (object) { return !objectIds.includes(object.id); });
            this.length = 0;
            this.push.apply(this, filtered);
            if (emit && (socket === null || socket === void 0 ? void 0 : socket.connected)) {
                emitters.deleteTempObjects(objectIds);
            }
        } }));
    var emitters = {
        updateSelf: throttle(function (updates) {
            socket === null || socket === void 0 ? void 0 : socket.emit('update_collaborator', updates, collaborators.self.id);
        }, 300),
        updateTempObjects: throttle(function (newObjects) {
            var transportObjects = newObjects.map(function (object) {
                return objectToTransport(object);
            });
            socket === null || socket === void 0 ? void 0 : socket.emit('update_temp_objects', transportObjects);
        }, 500),
        deleteTempObjects: throttle(function (objectIds) {
            socket === null || socket === void 0 ? void 0 : socket.emit('delete_temp_objects', objectIds);
        }, 500)
    };
    var collaborators = $state({
        self: defaultSelf,
        others: [],
        updateSelf: function (updates, emit) {
            if (emit === void 0) { emit = true; }
            this.self = __assign(__assign({}, this.self), updates);
            if (emit && (socket === null || socket === void 0 ? void 0 : socket.connected)) {
                emitters.updateSelf(__assign(__assign({}, updates), { lastActive: new Date() }));
            }
        },
        updateOther: function (id, updates) {
            var index = this.others.findIndex(function (c) { return c.id === id; });
            if (index !== -1) {
                this.others[index] = __assign(__assign({}, this.others[index]), updates);
            }
            else {
                if (id) {
                    this.others.push(__assign({ id: id }, updates));
                }
            }
        },
        deleteOther: function (id) {
            this.others = this.others.filter(function (c) { return c.id !== id; });
        }
    });
    var socket = null;
    if (browser) {
        socket = io(PUBLIC_SOCKET_URL, {
            reconnectionDelayMax: 10000,
            auth: { boardId: board.id },
            withCredentials: true
        });
        socket.on('board_updated', function (updates) {
            board.update(updates, false);
        });
        socket.on('objects_updated', function (newObjects) {
            var objects = newObjects.map(function (transportObject) {
                return transportToObject(transportObject);
            });
            board.updateObjects(objects, false);
        });
        socket.on('objects_deleted', function (objectIds) {
            board.deleteObjects(objectIds, false);
        });
        socket.on('temp_objects_updated', function (newObjects) {
            var objects = newObjects.map(function (transportObject) {
                return transportToObject(transportObject);
            });
            tempObjects.update(objects, false);
        });
        socket.on('temp_objects_deleted', function (objectIds) {
            tempObjects.delete(objectIds, false);
        });
        socket.on('collaborator_updated', function (updates, id) {
            collaborators.updateOther(id, updates);
        });
        socket.on('user_join', function (collaborator) {
            collaborators.updateOther(collaborator.id, collaborator);
        });
        socket.on('user_leave', function (collaboratorId) {
            var leavingCollaborator = collaborators.others.find(function (collaborator) {
                return collaborator.id === collaboratorId;
            });
            console.log("".concat(leavingCollaborator.name, " Left"));
            collaborators.deleteOther(collaboratorId);
        });
        socket.on('connect', function () {
            console.log('Connected to board:', board.id);
        });
        socket.on('connect_init', function (self, others, boardData) {
            collaborators.updateSelf(self, false);
            collaborators.others = others;
            board.update(boardData, false);
            board.loading = false;
        });
        socket.on('disconnect', function () {
            console.log('Disconnected from board:', board.id);
        });
    }
    return { board: board, collaborators: collaborators, tempObjects: tempObjects };
}
//# sourceMappingURL=realtime-board.svelte.js.map