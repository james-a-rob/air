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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
var fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
var ffmpeg_static_1 = __importDefault(require("ffmpeg-static"));
var db_1 = require("./db");
fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_static_1.default);
var process = function (scene, event) {
    return new Promise(function (resolve, reject) {
        var sceneLocation = path_1.default.join(__dirname, "../".concat(scene.location));
        var newEventDirLocation = path_1.default.join(__dirname, "../events/".concat(event.id));
        var segmentLocation = path_1.default.join(__dirname, "../events/".concat(event.id, "/file-").concat(scene.id, "-%03d.ts"));
        var outputLocation = path_1.default.join(__dirname, "../events/".concat(event.id, "/output-initial.m3u8"));
        fs_extra_1.default.ensureDir(newEventDirLocation);
        var ff = (0, fluent_ffmpeg_1.default)();
        console.log('ffmpeg', ff.kill);
        ff.addInput(sceneLocation)
            .inputOptions('-re')
            .addOptions([
            '-profile:v baseline',
            '-level 3.0',
            '-start_number 0',
            '-hls_time 6',
            '-sc_threshold 0',
            "-hls_segment_filename ".concat(segmentLocation),
            '-hls_playlist_type event',
            '-hls_flags delete_segments+program_date_time+append_list+omit_endlist+independent_segments+discont_start',
            '-f hls'
        ]).output(outputLocation).on('end', function () {
            resolve(true);
        }).on('start', function (data) {
            // console.log(data);
        })
            .on('progress', function (data) {
            // console.log(data);
        }).on('error', function (err, stdout, stderr) {
            console.log('error---', err, stdout, stderr);
        }).run();
    });
};
var start = function (eventId) {
    var run = function () { return __awaiter(void 0, void 0, void 0, function () {
        var nextSceneExists, sceneIteration, liveEvent, firstScene, uptoDateLiveEvent, sceneToStream, nextScene;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sceneIteration = 0;
                    return [4 /*yield*/, (0, db_1.getLiveEvent)(eventId.toString())];
                case 1:
                    liveEvent = _a.sent();
                    firstScene = liveEvent.scenes[0];
                    if (firstScene) {
                        nextSceneExists = true;
                    }
                    _a.label = 2;
                case 2:
                    if (!nextSceneExists) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, db_1.getLiveEvent)(eventId.toString())];
                case 3:
                    uptoDateLiveEvent = _a.sent();
                    sceneToStream = uptoDateLiveEvent.scenes.find(function (scene) { return scene.id === firstScene.id + sceneIteration; });
                    return [4 /*yield*/, process(sceneToStream, liveEvent)];
                case 4:
                    _a.sent();
                    nextScene = uptoDateLiveEvent.scenes.find(function (scene) { return scene.id === firstScene.id + sceneIteration + 1; });
                    if (nextScene) {
                        nextSceneExists = true;
                        sceneIteration++;
                    }
                    else if (!nextScene && uptoDateLiveEvent.loop) {
                        nextSceneExists = true;
                        sceneIteration = 0;
                    }
                    else {
                        nextSceneExists = false;
                    }
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    run();
};
exports.start = start;
//# sourceMappingURL=video-processor.js.map