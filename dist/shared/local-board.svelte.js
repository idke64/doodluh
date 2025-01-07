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
var _a;
import { browser } from '$app/environment';
import { v4 as uuidv4 } from 'uuid';
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
export function createLocalBoard() {
    var board = $state(__assign(__assign({}, (browser
        ? JSON.parse(localStorage.getItem('board') || JSON.stringify(defaultBoard))
        : defaultBoard)), { update: function (updates, emit) {
            if (emit === void 0) { emit = true; }
            Object.assign(this, __assign(__assign({}, updates), { updatedAt: new Date() }));
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
        }, deleteObjects: function (objectIds, emit) {
            if (emit === void 0) { emit = true; }
            this.objects = this.objects.filter(function (object) { return !objectIds.includes(object.id); });
            this.updatedAt = new Date();
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
        }, delete: function (objectIds, emit) {
            if (emit === void 0) { emit = true; }
            var filtered = __spreadArray([], this, true).filter(function (object) { return !objectIds.includes(object.id); });
            this.length = 0;
            this.push.apply(this, filtered);
        } }));
    var collaborators = $state({
        self: defaultSelf,
        others: [],
        updateSelf: function (updates) {
            this.self = __assign(__assign({}, this.self), updates);
        },
        updateOther: function (id, updates) {
            var index = this.others.findIndex(function (c) { return c.id === id; });
            if (index !== -1) {
                this.others[index] = __assign(__assign({}, this.others[index]), updates);
            }
            else {
                this.others.push(__assign({ id: id }, updates));
            }
        },
        deleteOther: function (id) {
            this.others = this.others.filter(function (c) { return c.id !== id; });
        }
    });
    $effect.root(function () {
        $effect(function () {
            if (browser) {
                localStorage.setItem('board', JSON.stringify(board));
            }
        });
    });
    return { board: board, collaborators: collaborators, tempObjects: tempObjects };
}
export var board = (_a = createLocalBoard(), _a.board), collaborators = _a.collaborators, tempObjects = _a.tempObjects;
//# sourceMappingURL=local-board.svelte.js.map