import { GitHub } from 'arctic';
import { Google } from 'arctic';
var GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
var GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export var github = new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, null);
export var google = new Google(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, "".concat(process.env.APP_URL, "/api/auth/login/google/callback"));
//# sourceMappingURL=oauth.js.map