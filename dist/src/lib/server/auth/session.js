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
import { db } from '../../server/database/db.js';
import { users, userSessions } from '../../server/database/schema.js';
import { eq } from 'drizzle-orm';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
export var generateSessionToken = function () {
    var bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    var token = encodeBase32LowerCaseNoPadding(bytes);
    return token;
};
export var createSession = function (token, userId) { return __awaiter(void 0, void 0, void 0, function () {
    var sessionId, session, s;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
                session = {
                    id: sessionId,
                    userId: userId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
                };
                return [4 /*yield*/, db.insert(userSessions).values(session)];
            case 1:
                s = _a.sent();
                console.log('creating session', s);
                return [2 /*return*/, session];
        }
    });
}); };
export var validateSessionToken = function (token) { return __awaiter(void 0, void 0, void 0, function () {
    var sessionId, result, _a, user, session;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
                return [4 /*yield*/, db
                        .select({ user: users, session: userSessions })
                        .from(userSessions)
                        .innerJoin(users, eq(userSessions.userId, users.id))
                        .where(eq(userSessions.id, sessionId))];
            case 1:
                result = _b.sent();
                if (result.length < 1) {
                    return [2 /*return*/, { session: null, user: null }];
                }
                _a = result[0], user = _a.user, session = _a.session;
                if (!(Date.now() >= session.expiresAt.getTime())) return [3 /*break*/, 3];
                return [4 /*yield*/, db.delete(userSessions).where(eq(userSessions.id, session.id))];
            case 2:
                _b.sent();
                return [2 /*return*/, { session: null, user: null }];
            case 3:
                if (!(Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15)) return [3 /*break*/, 5];
                session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
                return [4 /*yield*/, db
                        .update(userSessions)
                        .set({
                        expiresAt: session.expiresAt
                    })
                        .where(eq(userSessions.id, session.id))];
            case 4:
                _b.sent();
                _b.label = 5;
            case 5: return [2 /*return*/, { session: session, user: user }];
        }
    });
}); };
export function invalidateSession(sessionId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.delete(userSessions).where(eq(userSessions.id, sessionId))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
export function setSessionTokenCookie(event, token, expiresAt) {
    event.cookies.set('session', token, {
        httpOnly: true,
        sameSite: 'lax',
        expires: expiresAt,
        path: '/',
        secure: process.env.NODE_ENV === 'production'
    });
}
export function deleteSessionTokenCookie(event) {
    event.cookies.set('session', '', {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
        secure: process.env.NODE_ENV === 'production'
    });
}
//# sourceMappingURL=session.js.map