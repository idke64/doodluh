var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
export var getSquaredDistance = function (p1, p2) {
    return Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2);
};
export var getBoxCorners = function (box) {
    var c = Math.cos(box.rotation);
    var s = Math.sin(box.rotation);
    var cx = box.pos.x + box.width / 2;
    var cy = box.pos.y + box.height / 2;
    return [
        {
            x: cx + ((-box.width / 2) * c - (-box.height / 2) * s),
            y: cy + ((-box.width / 2) * s + (-box.height / 2) * c)
        },
        {
            x: cx + ((box.width / 2) * c - (-box.height / 2) * s),
            y: cy + ((box.width / 2) * s + (-box.height / 2) * c)
        },
        {
            x: cx + ((box.width / 2) * c - (box.height / 2) * s),
            y: cy + ((box.width / 2) * s + (box.height / 2) * c)
        },
        {
            x: cx + ((-box.width / 2) * c - (box.height / 2) * s),
            y: cy + ((-box.width / 2) * s + (box.height / 2) * c)
        }
    ];
};
export var boxContainsBox = function (b1, b2) {
    if (b1.rotation === 0 && b2.rotation === 0) {
        return (b1.pos.x <= b2.pos.x &&
            b1.pos.y <= b2.pos.y &&
            b1.pos.x + b1.width >= b2.pos.x + b2.width &&
            b1.pos.y + b1.height >= b2.pos.y + b2.height);
    }
    var corners2 = getBoxCorners(b2);
    return corners2.every(function (corner) { return boxContainsPoint(b1, corner); });
};
export var boxContainsPoint = function (box, p) {
    if (box.rotation === 0) {
        return (p.x >= box.pos.x &&
            p.x <= box.pos.x + box.width &&
            p.y >= box.pos.y &&
            p.y <= box.pos.y + box.height);
    }
    var corners = getBoxCorners(box);
    return pointInPolygon(p, corners);
};
function getEdges(poly) {
    return poly.map(function (p, i) {
        var next = poly[(i + 1) % poly.length];
        return { start: { x: p.x, y: p.y }, end: { x: next.x - p.x, y: next.y - p.y } };
    });
}
function pointInPolygon(p, poly) {
    var edges = getEdges(poly);
    var intersects = 0;
    for (var _i = 0, edges_1 = edges; _i < edges_1.length; _i++) {
        var edge = edges_1[_i];
        var vectorEdge = { x: edge.end.x - edge.start.x, y: edge.end.y - edge.start.y };
        if (vectorEdge.y == 0) {
            continue;
        }
        var vectorPointToStart = { x: edge.start.x - p.x, y: edge.start.y - p.y };
        if (-(vectorPointToStart.y / vectorEdge.y) >= 0 &&
            -(vectorPointToStart.y / vectorEdge.y) <= 1 &&
            vectorPointToStart.x - (vectorPointToStart.y / vectorEdge.y) * vectorEdge.x > 0) {
            intersects++;
        }
    }
    return intersects % 2 === 1;
}
export var boxesOverlap = function (b1, b2) {
    if (b1.rotation === 0 && b2.rotation === 0) {
        return !(b1.pos.x + b1.width < b2.pos.x ||
            b2.pos.x + b2.width < b1.pos.x ||
            b1.pos.y + b1.height < b2.pos.y ||
            b2.pos.y + b2.height < b1.pos.y);
    }
    var corners1 = getBoxCorners(b1);
    var corners2 = getBoxCorners(b2);
    return polygonsOverlap(corners1, corners2);
};
export var polygonsOverlap = function (poly1, poly2) {
    var edges1 = getEdges(poly1);
    var edges2 = getEdges(poly2);
    for (var _i = 0, _a = __spreadArray(__spreadArray([], edges1, true), edges2, true); _i < _a.length; _i++) {
        var edge = _a[_i];
        var axis = normalize({ x: -edge.end.y, y: edge.end.x });
        var _b = projectPolygon(poly1, axis), min1 = _b[0], max1 = _b[1];
        var _c = projectPolygon(poly2, axis), min2 = _c[0], max2 = _c[1];
        if (max1 < min2 || max2 < min1) {
            return false;
        }
    }
    return true;
};
function normalize(v) {
    var len = Math.sqrt(v.x * v.x + v.y * v.y);
    return { x: v.x / len, y: v.y / len };
}
function projectPolygon(poly, axis) {
    var dots = poly.map(function (p) { return p.x * axis.x + p.y * axis.y; });
    return [Math.min.apply(Math, dots), Math.max.apply(Math, dots)];
}
//# sourceMappingURL=math.js.map