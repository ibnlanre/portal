"use strict";
"use client";
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = function(target, all) {
    for(var name in all)__defProp(target, name, {
        get: all[name],
        enumerable: true
    });
};
var __copyProps = function(to, from, except, desc) {
    if (from && typeof from === "object" || typeof from === "function") {
        var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
        try {
            var _loop = function() {
                var key = _step.value;
                if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
                    get: function() {
                        return from[key];
                    },
                    enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
                });
            };
            for(var _iterator = __getOwnPropNames(from)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true)_loop();
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally{
            try {
                if (!_iteratorNormalCompletion && _iterator.return != null) {
                    _iterator.return();
                }
            } finally{
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }
    return to;
};
var __toCommonJS = function(mod) {
    return __copyProps(__defProp({}, "__esModule", {
        value: true
    }), mod);
};
// src/index.ts
var src_exports = {};
__export(src_exports, {
    getPortalEntries: function() {
        return getPortalEntries;
    },
    getPortalReducers: function() {
        return getPortalReducers;
    },
    usePortal: function() {
        return usePortal;
    }
});
module.exports = __toCommonJS(src_exports);
// src/usePortal.ts
var import_react = require("react");
var import_rxjs = require("rxjs");
var isFunction = function(v) {
    return typeof v === "function";
};
function updateState(observable, prevState, dispatch) {
    var setter = function(value) {
        dispatch ? observable.next(dispatch(prevState, value)) : isFunction(value) ? observable.next(value(prevState)) : observable.next(value);
    };
    return setter;
}
function usePortal(key, initialState, reducer) {
    var context = getPortalEntries();
    var _context_get;
    var observable = (_context_get = context.get(key)) !== null && _context_get !== void 0 ? _context_get : new import_rxjs.BehaviorSubject(initialState);
    if (!context.has(key)) context.set(key, observable);
    var frame = getPortalReducers();
    var _frame_get;
    var dispatch = (_frame_get = frame.get(observable)) !== null && _frame_get !== void 0 ? _frame_get : reducer;
    if (reducer && !frame.has(observable)) frame.set(observable, reducer);
    var _ref = _sliced_to_array((0, import_react.useState)(initialState), 2), state = _ref[0], setState = _ref[1];
    var subRef = (0, import_react.useRef)();
    (0, import_react.useEffect)(function() {
        subRef.current = observable.subscribe(setState);
        return function() {
            var _subRef_current;
            return (_subRef_current = subRef.current) === null || _subRef_current === void 0 ? void 0 : _subRef_current.unsubscribe();
        };
    }, []);
    var setter = updateState(observable, state, dispatch);
    return [
        state,
        setter
    ];
}
// src/index.ts
var globe = typeof global !== "undefined" ? global : window;
if (!globe) throw new Error("Global Object is undefined");
if (!globe["__$portal_ENTRIES"]) globe.__$portal_ENTRIES = /* @__PURE__ */ new Map();
var getPortalEntries = function() {
    return globe.__$portal_ENTRIES;
};
if (!globe["__$portal_REDUCERS"]) globe.__$portal_REDUCERS = /* @__PURE__ */ new WeakMap();
var getPortalReducers = function() {
    return globe.__$portal_REDUCERS;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
    getPortalEntries: getPortalEntries,
    getPortalReducers: getPortalReducers,
    usePortal: usePortal
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcUmlkd2FuT2xhbnJld2FqdVxcRG9jdW1lbnRzXFxwb3J0YWxcXGRpc3RcXGluZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXCJ1c2UgY2xpZW50XCI7XG52YXIgX19kZWZQcm9wID0gT2JqZWN0LmRlZmluZVByb3BlcnR5O1xudmFyIF9fZ2V0T3duUHJvcERlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xudmFyIF9fZ2V0T3duUHJvcE5hbWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXM7XG52YXIgX19oYXNPd25Qcm9wID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciBfX2V4cG9ydCA9ICh0YXJnZXQsIGFsbCkgPT4ge1xuICBmb3IgKHZhciBuYW1lIGluIGFsbClcbiAgICBfX2RlZlByb3AodGFyZ2V0LCBuYW1lLCB7IGdldDogYWxsW25hbWVdLCBlbnVtZXJhYmxlOiB0cnVlIH0pO1xufTtcbnZhciBfX2NvcHlQcm9wcyA9ICh0bywgZnJvbSwgZXhjZXB0LCBkZXNjKSA9PiB7XG4gIGlmIChmcm9tICYmIHR5cGVvZiBmcm9tID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBmcm9tID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBmb3IgKGxldCBrZXkgb2YgX19nZXRPd25Qcm9wTmFtZXMoZnJvbSkpXG4gICAgICBpZiAoIV9faGFzT3duUHJvcC5jYWxsKHRvLCBrZXkpICYmIGtleSAhPT0gZXhjZXB0KVxuICAgICAgICBfX2RlZlByb3AodG8sIGtleSwgeyBnZXQ6ICgpID0+IGZyb21ba2V5XSwgZW51bWVyYWJsZTogIShkZXNjID0gX19nZXRPd25Qcm9wRGVzYyhmcm9tLCBrZXkpKSB8fCBkZXNjLmVudW1lcmFibGUgfSk7XG4gIH1cbiAgcmV0dXJuIHRvO1xufTtcbnZhciBfX3RvQ29tbW9uSlMgPSAobW9kKSA9PiBfX2NvcHlQcm9wcyhfX2RlZlByb3Aoe30sIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pLCBtb2QpO1xuXG4vLyBzcmMvaW5kZXgudHNcbnZhciBzcmNfZXhwb3J0cyA9IHt9O1xuX19leHBvcnQoc3JjX2V4cG9ydHMsIHtcbiAgZ2V0UG9ydGFsRW50cmllczogKCkgPT4gZ2V0UG9ydGFsRW50cmllcyxcbiAgZ2V0UG9ydGFsUmVkdWNlcnM6ICgpID0+IGdldFBvcnRhbFJlZHVjZXJzLFxuICB1c2VQb3J0YWw6ICgpID0+IHVzZVBvcnRhbFxufSk7XG5tb2R1bGUuZXhwb3J0cyA9IF9fdG9Db21tb25KUyhzcmNfZXhwb3J0cyk7XG5cbi8vIHNyYy91c2VQb3J0YWwudHNcbnZhciBpbXBvcnRfcmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIik7XG52YXIgaW1wb3J0X3J4anMgPSByZXF1aXJlKFwicnhqc1wiKTtcbnZhciBpc0Z1bmN0aW9uID0gKHYpID0+IHR5cGVvZiB2ID09PSBcImZ1bmN0aW9uXCI7XG5mdW5jdGlvbiB1cGRhdGVTdGF0ZShvYnNlcnZhYmxlLCBwcmV2U3RhdGUsIGRpc3BhdGNoKSB7XG4gIGNvbnN0IHNldHRlciA9ICh2YWx1ZSkgPT4ge1xuICAgIGRpc3BhdGNoID8gb2JzZXJ2YWJsZS5uZXh0KGRpc3BhdGNoKHByZXZTdGF0ZSwgdmFsdWUpKSA6IGlzRnVuY3Rpb24odmFsdWUpID8gb2JzZXJ2YWJsZS5uZXh0KHZhbHVlKHByZXZTdGF0ZSkpIDogb2JzZXJ2YWJsZS5uZXh0KHZhbHVlKTtcbiAgfTtcbiAgcmV0dXJuIHNldHRlcjtcbn1cbmZ1bmN0aW9uIHVzZVBvcnRhbChrZXksIGluaXRpYWxTdGF0ZSwgcmVkdWNlcikge1xuICBjb25zdCBjb250ZXh0ID0gZ2V0UG9ydGFsRW50cmllcygpO1xuICBjb25zdCBvYnNlcnZhYmxlID0gY29udGV4dC5nZXQoa2V5KSA/PyBuZXcgaW1wb3J0X3J4anMuQmVoYXZpb3JTdWJqZWN0KGluaXRpYWxTdGF0ZSk7XG4gIGlmICghY29udGV4dC5oYXMoa2V5KSlcbiAgICBjb250ZXh0LnNldChrZXksIG9ic2VydmFibGUpO1xuICBjb25zdCBmcmFtZSA9IGdldFBvcnRhbFJlZHVjZXJzKCk7XG4gIGNvbnN0IGRpc3BhdGNoID0gZnJhbWUuZ2V0KG9ic2VydmFibGUpID8/IHJlZHVjZXI7XG4gIGlmIChyZWR1Y2VyICYmICFmcmFtZS5oYXMob2JzZXJ2YWJsZSkpXG4gICAgZnJhbWUuc2V0KG9ic2VydmFibGUsIHJlZHVjZXIpO1xuICBjb25zdCBbc3RhdGUsIHNldFN0YXRlXSA9ICgwLCBpbXBvcnRfcmVhY3QudXNlU3RhdGUpKGluaXRpYWxTdGF0ZSk7XG4gIGNvbnN0IHN1YlJlZiA9ICgwLCBpbXBvcnRfcmVhY3QudXNlUmVmKSgpO1xuICAoMCwgaW1wb3J0X3JlYWN0LnVzZUVmZmVjdCkoKCkgPT4ge1xuICAgIHN1YlJlZi5jdXJyZW50ID0gb2JzZXJ2YWJsZS5zdWJzY3JpYmUoc2V0U3RhdGUpO1xuICAgIHJldHVybiAoKSA9PiBzdWJSZWYuY3VycmVudD8udW5zdWJzY3JpYmUoKTtcbiAgfSwgW10pO1xuICBjb25zdCBzZXR0ZXIgPSB1cGRhdGVTdGF0ZShvYnNlcnZhYmxlLCBzdGF0ZSwgZGlzcGF0Y2gpO1xuICByZXR1cm4gW3N0YXRlLCBzZXR0ZXJdO1xufVxuXG4vLyBzcmMvaW5kZXgudHNcbnZhciBnbG9iZSA9IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB3aW5kb3c7XG5pZiAoIWdsb2JlKVxuICB0aHJvdyBuZXcgRXJyb3IoXCJHbG9iYWwgT2JqZWN0IGlzIHVuZGVmaW5lZFwiKTtcbmlmICghZ2xvYmVbXCJfXyRwb3J0YWxfRU5UUklFU1wiXSlcbiAgZ2xvYmUuX18kcG9ydGFsX0VOVFJJRVMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xudmFyIGdldFBvcnRhbEVudHJpZXMgPSAoKSA9PiBnbG9iZS5fXyRwb3J0YWxfRU5UUklFUztcbmlmICghZ2xvYmVbXCJfXyRwb3J0YWxfUkVEVUNFUlNcIl0pXG4gIGdsb2JlLl9fJHBvcnRhbF9SRURVQ0VSUyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgV2Vha01hcCgpO1xudmFyIGdldFBvcnRhbFJlZHVjZXJzID0gKCkgPT4gZ2xvYmUuX18kcG9ydGFsX1JFRFVDRVJTO1xuLy8gQW5ub3RhdGUgdGhlIENvbW1vbkpTIGV4cG9ydCBuYW1lcyBmb3IgRVNNIGltcG9ydCBpbiBub2RlOlxuMCAmJiAobW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldFBvcnRhbEVudHJpZXMsXG4gIGdldFBvcnRhbFJlZHVjZXJzLFxuICB1c2VQb3J0YWxcbn0pO1xuIl0sIm5hbWVzIjpbIl9fZGVmUHJvcCIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwiX19nZXRPd25Qcm9wRGVzYyIsImdldE93blByb3BlcnR5RGVzY3JpcHRvciIsIl9fZ2V0T3duUHJvcE5hbWVzIiwiZ2V0T3duUHJvcGVydHlOYW1lcyIsIl9faGFzT3duUHJvcCIsInByb3RvdHlwZSIsImhhc093blByb3BlcnR5IiwiX19leHBvcnQiLCJ0YXJnZXQiLCJhbGwiLCJuYW1lIiwiZ2V0IiwiZW51bWVyYWJsZSIsIl9fY29weVByb3BzIiwidG8iLCJmcm9tIiwiZXhjZXB0IiwiZGVzYyIsImtleSIsImNhbGwiLCJfX3RvQ29tbW9uSlMiLCJtb2QiLCJ2YWx1ZSIsInNyY19leHBvcnRzIiwiZ2V0UG9ydGFsRW50cmllcyIsImdldFBvcnRhbFJlZHVjZXJzIiwidXNlUG9ydGFsIiwibW9kdWxlIiwiZXhwb3J0cyIsImltcG9ydF9yZWFjdCIsInJlcXVpcmUiLCJpbXBvcnRfcnhqcyIsImlzRnVuY3Rpb24iLCJ2IiwidXBkYXRlU3RhdGUiLCJvYnNlcnZhYmxlIiwicHJldlN0YXRlIiwiZGlzcGF0Y2giLCJzZXR0ZXIiLCJuZXh0IiwiaW5pdGlhbFN0YXRlIiwicmVkdWNlciIsImNvbnRleHQiLCJCZWhhdmlvclN1YmplY3QiLCJoYXMiLCJzZXQiLCJmcmFtZSIsInVzZVN0YXRlIiwic3RhdGUiLCJzZXRTdGF0ZSIsInN1YlJlZiIsInVzZVJlZiIsInVzZUVmZmVjdCIsImN1cnJlbnQiLCJzdWJzY3JpYmUiLCJ1bnN1YnNjcmliZSIsImdsb2JlIiwiZ2xvYmFsIiwid2luZG93IiwiRXJyb3IiLCJfXyRwb3J0YWxfRU5UUklFUyIsIk1hcCIsIl9fJHBvcnRhbF9SRURVQ0VSUyIsIldlYWtNYXAiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsSUFBSUEsWUFBWUMsT0FBT0M7QUFDdkIsSUFBSUMsbUJBQW1CRixPQUFPRztBQUM5QixJQUFJQyxvQkFBb0JKLE9BQU9LO0FBQy9CLElBQUlDLGVBQWVOLE9BQU9PLFVBQVVDO0FBQ3BDLElBQUlDLFdBQVcsU0FBQ0MsUUFBUUM7SUFDdEIsSUFBSyxJQUFJQyxRQUFRRCxJQUNmWixVQUFVVyxRQUFRRSxNQUFNO1FBQUVDLEtBQUtGLEdBQUcsQ0FBQ0MsS0FBSztRQUFFRSxZQUFZO0lBQUs7QUFDL0Q7QUFDQSxJQUFJQyxjQUFjLFNBQUNDLElBQUlDLE1BQU1DLFFBQVFDO0lBQ25DLElBQUlGLFFBQVEsT0FBT0EsU0FBUyxZQUFZLE9BQU9BLFNBQVMsWUFBWTtZQUM3RCxrQ0FBQSwyQkFBQTs7O2dCQUFBLElBQUlHLE1BQUo7Z0JBQ0gsSUFBSSxDQUFDZCxhQUFhZSxLQUFLTCxJQUFJSSxRQUFRQSxRQUFRRixRQUN6Q25CLFVBQVVpQixJQUFJSSxLQUFLO29CQUFFUCxLQUFLOytCQUFNSSxJQUFJLENBQUNHLElBQUk7O29CQUFFTixZQUFZLENBQUVLLENBQUFBLE9BQU9qQixpQkFBaUJlLE1BQU1HLElBQUcsS0FBTUQsS0FBS0w7Z0JBQVc7O1lBRnBILFFBQUssWUFBV1Ysa0JBQWtCYSwwQkFBN0IsU0FBQSw2QkFBQSxRQUFBLHlCQUFBOztZQUFBO1lBQUE7OztxQkFBQSw2QkFBQTtvQkFBQTs7O29CQUFBOzBCQUFBOzs7O0lBR1A7SUFDQSxPQUFPRDtBQUNUO0FBQ0EsSUFBSU0sZUFBZSxTQUFDQztXQUFRUixZQUFZaEIsVUFBVSxDQUFDLEdBQUcsY0FBYztRQUFFeUIsT0FBTztJQUFLLElBQUlEOztBQUV0RixlQUFlO0FBQ2YsSUFBSUUsY0FBYyxDQUFDO0FBQ25CaEIsU0FBU2dCLGFBQWE7SUFDcEJDLGtCQUFrQjtlQUFNQTs7SUFDeEJDLG1CQUFtQjtlQUFNQTs7SUFDekJDLFdBQVc7ZUFBTUE7O0FBQ25CO0FBQ0FDLE9BQU9DLFVBQVVSLGFBQWFHO0FBRTlCLG1CQUFtQjtBQUNuQixJQUFJTSxlQUFlQyxRQUFRO0FBQzNCLElBQUlDLGNBQWNELFFBQVE7QUFDMUIsSUFBSUUsYUFBYSxTQUFDQztXQUFNLE9BQU9BLE1BQU07O0FBQ3JDLFNBQVNDLFlBQVlDLFVBQVUsRUFBRUMsU0FBUyxFQUFFQyxRQUFRO0lBQ2xELElBQU1DLFNBQVMsU0FBQ2hCO1FBQ2RlLFdBQVdGLFdBQVdJLEtBQUtGLFNBQVNELFdBQVdkLFVBQVVVLFdBQVdWLFNBQVNhLFdBQVdJLEtBQUtqQixNQUFNYyxjQUFjRCxXQUFXSSxLQUFLakI7SUFDbkk7SUFDQSxPQUFPZ0I7QUFDVDtBQUNBLFNBQVNaLFVBQVVSLEdBQUcsRUFBRXNCLFlBQVksRUFBRUMsT0FBTztJQUMzQyxJQUFNQyxVQUFVbEI7UUFDR2tCO0lBQW5CLElBQU1QLGFBQWFPLENBQUFBLGVBQUFBLFFBQVEvQixJQUFJTyxrQkFBWndCLDBCQUFBQSxlQUFvQixJQUFJWCxZQUFZWSxnQkFBZ0JIO0lBQ3ZFLElBQUksQ0FBQ0UsUUFBUUUsSUFBSTFCLE1BQ2Z3QixRQUFRRyxJQUFJM0IsS0FBS2lCO0lBQ25CLElBQU1XLFFBQVFyQjtRQUNHcUI7SUFBakIsSUFBTVQsV0FBV1MsQ0FBQUEsYUFBQUEsTUFBTW5DLElBQUl3Qix5QkFBVlcsd0JBQUFBLGFBQXlCTDtJQUMxQyxJQUFJQSxXQUFXLENBQUNLLE1BQU1GLElBQUlULGFBQ3hCVyxNQUFNRCxJQUFJVixZQUFZTTtJQUN4QixJQUEwQix3QkFBQSxBQUFDLENBQUEsR0FBR1osYUFBYWtCLFFBQU8sRUFBR1AsbUJBQTlDUSxRQUFtQixTQUFaQyxXQUFZO0lBQzFCLElBQU1DLFNBQVMsQUFBQyxDQUFBLEdBQUdyQixhQUFhc0IsTUFBSztJQUNwQyxDQUFBLEdBQUd0QixhQUFhdUIsU0FBUSxFQUFHO1FBQzFCRixPQUFPRyxVQUFVbEIsV0FBV21CLFVBQVVMO1FBQ3RDLE9BQU87Z0JBQU1DO1lBQUFBLE9BQUFBLENBQUFBLGtCQUFBQSxPQUFPRyxxQkFBUEgsNkJBQUFBLEtBQUFBLElBQUFBLGdCQUFnQks7O0lBQy9CLEdBQUcsRUFBRTtJQUNMLElBQU1qQixTQUFTSixZQUFZQyxZQUFZYSxPQUFPWDtJQUM5QyxPQUFPO1FBQUNXO1FBQU9WO0tBQU87QUFDeEI7QUFFQSxlQUFlO0FBQ2YsSUFBSWtCLFFBQVEsT0FBT0MsV0FBVyxjQUFjQSxTQUFTQztBQUNyRCxJQUFJLENBQUNGLE9BQ0gsTUFBTSxJQUFJRyxNQUFNO0FBQ2xCLElBQUksQ0FBQ0gsS0FBSyxDQUFDLG9CQUFvQixFQUM3QkEsTUFBTUksb0JBQW9CLGFBQWEsR0FBRyxJQUFJQztBQUNoRCxJQUFJckMsbUJBQW1CO1dBQU1nQyxNQUFNSTs7QUFDbkMsSUFBSSxDQUFDSixLQUFLLENBQUMscUJBQXFCLEVBQzlCQSxNQUFNTSxxQkFBcUIsYUFBYSxHQUFHLElBQUlDO0FBQ2pELElBQUl0QyxvQkFBb0I7V0FBTStCLE1BQU1NOztBQUNwQyw2REFBNkQ7QUFDN0QsS0FBTW5DLENBQUFBLE9BQU9DLFVBQVU7SUFDckJKLGtCQUFBQTtJQUNBQyxtQkFBQUE7SUFDQUMsV0FBQUE7QUFDRixDQUFBIn0=//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2luZGV4LnRzIiwgIi4uL3NyYy91c2VQb3J0YWwudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIlwidXNlIGNsaWVudFwiO1xyXG5cclxubGV0IGdsb2JlID0gdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHdpbmRvdztcclxuaWYgKCFnbG9iZSkgdGhyb3cgbmV3IEVycm9yKFwiR2xvYmFsIE9iamVjdCBpcyB1bmRlZmluZWRcIik7XHJcblxyXG5pZiAoIWdsb2JlW1wiX18kcG9ydGFsX0VOVFJJRVNcIl0pIGdsb2JlLl9fJHBvcnRhbF9FTlRSSUVTID0gbmV3IE1hcCgpO1xyXG5leHBvcnQgY29uc3QgZ2V0UG9ydGFsRW50cmllcyA9IDxLLCBWPigpID0+XHJcbiAgZ2xvYmUuX18kcG9ydGFsX0VOVFJJRVMgYXMgUG9ydGFsS2V5czxLLCBWPjtcclxuXHJcbmlmICghZ2xvYmVbXCJfXyRwb3J0YWxfUkVEVUNFUlNcIl0pIGdsb2JlLl9fJHBvcnRhbF9SRURVQ0VSUyA9IG5ldyBXZWFrTWFwKCk7XHJcbmV4cG9ydCBjb25zdCBnZXRQb3J0YWxSZWR1Y2VycyA9IDxWLCBBPigpID0+XHJcbiAgZ2xvYmUuX18kcG9ydGFsX1JFRFVDRVJTIGFzIFBvcnRhbFJlZHVjZXJzPFYsIEE+O1xyXG5cclxuZXhwb3J0ICogZnJvbSBcIi4vdXNlUG9ydGFsXCI7XHJcbiIsICJpbXBvcnQgeyBSZWR1Y2VyU3RhdGUsIHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xyXG5pbXBvcnQgeyBSZWR1Y2VyLCBEaXNwYXRjaCwgU2V0U3RhdGVBY3Rpb24gfSBmcm9tIFwicmVhY3RcIjtcclxuaW1wb3J0IHsgQmVoYXZpb3JTdWJqZWN0LCBTdWJzY3JpcHRpb24gfSBmcm9tIFwicnhqc1wiO1xyXG5pbXBvcnQgeyBnZXRQb3J0YWxFbnRyaWVzLCBnZXRQb3J0YWxSZWR1Y2VycyB9IGZyb20gXCIuXCI7XHJcblxyXG4vKipcclxuICpcclxuICogQ2hlY2sgaWYgdGhlIHByb3ZpZGVkIHZhbHVlIGlzIGEgZnVuY3Rpb24uXHJcbiAqIEBwYXJhbSB2IC0gVmFsdWUgdG8gYmUgY2hlY2tlZC5cclxuICogQHJldHVybnMgYHRydWVgIGlmIHRoZSB2YWx1ZSBpcyBhIGZ1bmN0aW9uLCBgZmFsc2VgIG90aGVyd2lzZS5cclxuICovXHJcbmNvbnN0IGlzRnVuY3Rpb24gPSAodjogYW55KTogdiBpcyBGdW5jdGlvbiA9PiB0eXBlb2YgdiA9PT0gXCJmdW5jdGlvblwiO1xyXG5cclxuLyoqXHJcbiAqXHJcbiAqIFVwZGF0ZSB0aGUgc3RhdGUgb2YgYW4gb2JzZXJ2YWJsZSB1c2luZyB0aGUgcHJvdmlkZWQgdmFsdWUgYW5kIGRpc3BhdGNoIGZ1bmN0aW9uIChvcHRpb25hbCkuXHJcbiAqIEBwYXJhbSBvYnNlcnZhYmxlIC0gQmVoYXZpb3JTdWJqZWN0IHJlcHJlc2VudGluZyB0aGUgc3RhdGUuXHJcbiAqIEBwYXJhbSBwcmV2U3RhdGUgLSBQcmV2aW91cyBzdGF0ZSB2YWx1ZS5cclxuICogQHBhcmFtIGRpc3BhdGNoIC0gT3B0aW9uYWwgcmVkdWNlciBmdW5jdGlvbiB0byBoYW5kbGUgc3RhdGUgdXBkYXRlcy5cclxuICogQHJldHVybnMgQSBmdW5jdGlvbiB0aGF0IHRha2VzIGEgdmFsdWUgb3IgYWN0aW9uIGFuZCB1cGRhdGVzIHRoZSBzdGF0ZSBhY2NvcmRpbmdseS5cclxuICovXHJcbmZ1bmN0aW9uIHVwZGF0ZVN0YXRlPFMsIEE+KFxyXG4gIG9ic2VydmFibGU6IEJlaGF2aW9yU3ViamVjdDxTPixcclxuICBwcmV2U3RhdGU6IFMsXHJcbiAgZGlzcGF0Y2g/OiBSZWR1Y2VyPGFueSwgQT5cclxuKSB7XHJcbiAgLyoqXHJcbiAgICpcclxuICAgKiBVcGRhdGUgdGhlIHN0YXRlIG9mIGFuIG9ic2VydmFibGUgYmFzZWQgb24gdGhlIHByb3ZpZGVkIHZhbHVlIG9yIGFjdGlvbi5cclxuICAgKiBAcGFyYW0gdmFsdWUgLSBWYWx1ZSBvciBhY3Rpb24gdG8gdXBkYXRlIHRoZSBzdGF0ZSB3aXRoLlxyXG4gICAqIEByZXR1cm5zIHZvaWRcclxuICAgKlxyXG4gICAqIEBzdW1tYXJ5IElmIGEgZGlzcGF0Y2ggZnVuY3Rpb24gaXMgcHJvdmlkZWQsIGl0IGlzIHVzZWQgdG8gcHJvY2VzcyB0aGUgc3RhdGUgdXBkYXRlIGJhc2VkIG9uIHRoZSBwcmV2aW91cyBzdGF0ZSBhbmQgdGhlIHZhbHVlIG9yIGFjdGlvbi5cclxuICAgKiBAc3VtbWFyeSBJZiB0aGUgZGlzcGF0Y2ggZnVuY3Rpb24gaXMgbm90IHByb3ZpZGVkIGFuZCB0aGUgdmFsdWUgaXMgYSBmdW5jdGlvbiwgaXQgaXMgY2FsbGVkIHdpdGggdGhlIHByZXZpb3VzIHN0YXRlIGFuZCB0aGUgcmV0dXJuIHZhbHVlIGlzIHVzZWQgYXMgdGhlIG5ldyBzdGF0ZS5cclxuICAgKiBAc3VtbWFyeSBJZiBuZWl0aGVyIGEgZGlzcGF0Y2ggZnVuY3Rpb24gaXMgcHJvdmlkZWQgbm9yIHRoZSB2YWx1ZSBpcyBhIGZ1bmN0aW9uLCB0aGUgdmFsdWUgaXRzZWxmIGlzIHVzZWQgYXMgdGhlIG5ldyBzdGF0ZS5cclxuICAgKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBUaGUgdXBkYXRlZCBzdGF0ZSBpcyBlbWl0dGVkIHRocm91Z2ggdGhlIG9ic2VydmFibGUubmV4dCgpIG1ldGhvZC5cclxuICAgKi9cclxuICBjb25zdCBzZXR0ZXIgPSAodmFsdWU6IFNldFN0YXRlQWN0aW9uPFM+IHwgQSkgPT4ge1xyXG4gICAgZGlzcGF0Y2hcclxuICAgICAgPyBvYnNlcnZhYmxlLm5leHQoZGlzcGF0Y2gocHJldlN0YXRlLCB2YWx1ZSBhcyBBKSlcclxuICAgICAgOiBpc0Z1bmN0aW9uKHZhbHVlKVxyXG4gICAgICA/IG9ic2VydmFibGUubmV4dCh2YWx1ZShwcmV2U3RhdGUpKVxyXG4gICAgICA6IG9ic2VydmFibGUubmV4dCh2YWx1ZSBhcyBTKTtcclxuICB9O1xyXG4gIHJldHVybiBzZXR0ZXI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKlxyXG4gKiBDdXN0b20gaG9vayBmb3IgY3JlYXRpbmcgYSBwb3J0YWwgd2l0aCBiYXNpYyBzdGF0ZSBtYW5hZ2VtZW50LlxyXG4gKiBAcGFyYW0ga2V5IC0gVW5pcXVlIGtleSBpZGVudGlmaWVyIGZvciB0aGUgcG9ydGFsLlxyXG4gKiBAcGFyYW0gaW5pdGlhbFN0YXRlIC0gT3B0aW9uYWwgaW5pdGlhbCBzdGF0ZSBvZiB0aGUgcG9ydGFsLlxyXG4gKiBAcmV0dXJucyBBIHR1cGxlIGNvbnRhaW5pbmcgdGhlIHN0YXRlIGFuZCBkaXNwYXRjaCBmdW5jdGlvbiBmb3IgdXBkYXRpbmcgdGhlIHN0YXRlIHVzaW5nIHNldFN0YXRlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHVzZVBvcnRhbDxTPihcclxuICBrZXk6IHN0cmluZyxcclxuICBpbml0aWFsU3RhdGU/OiBTXHJcbik6IFtTLCBEaXNwYXRjaDxTZXRTdGF0ZUFjdGlvbjxTPj5dO1xyXG5cclxuLyoqXHJcbiAqXHJcbiAqIEN1c3RvbSBob29rIGZvciBjcmVhdGluZyBhIHBvcnRhbCB3aXRoIGFuIG9wdGlvbmFsIHJlZHVjZXIgdG8gdXBkYXRlIHRoZSBzdGF0ZS5cclxuICogQHBhcmFtIGtleSAtIFVuaXF1ZSBrZXkgaWRlbnRpZmllciBmb3IgdGhlIHBvcnRhbC5cclxuICogQHBhcmFtIGluaXRpYWxTdGF0ZSAtIEluaXRpYWwgc3RhdGUgb2YgdGhlIHBvcnRhbCwgd2hpY2ggY291bGQgYmUgYSByZWR1Y2VyIHN0YXRlLlxyXG4gKiBAcGFyYW0gcmVkdWNlciAtIE9wdGlvbmFsIHJlZHVjZXIgZnVuY3Rpb24gdG8gaGFuZGxlIHN0YXRlIHVwZGF0ZXMuXHJcbiAqIEByZXR1cm5zIEEgdHVwbGUgY29udGFpbmluZyB0aGUgc3RhdGUgYW5kIGRpc3BhdGNoIGZ1bmN0aW9uIGZvciB1cGRhdGluZyB0aGUgc3RhdGUuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdXNlUG9ydGFsPFMsIEE+KFxyXG4gIGtleTogc3RyaW5nLFxyXG4gIGluaXRpYWxTdGF0ZTogUyAmIFJlZHVjZXJTdGF0ZTxSZWR1Y2VyPFMsIEE+PixcclxuICByZWR1Y2VyPzogUmVkdWNlcjxTLCBBPlxyXG4pOiBbdHlwZW9mIGluaXRpYWxTdGF0ZSwgRGlzcGF0Y2g8QT5dO1xyXG5cclxuLyoqXHJcbiAqXHJcbiAqIEBkZXNjcmlwdGlvbiBJbXBsZW1lbnRhdGlvbiBmb3IgY3VzdG9tIHVzZVBvcnRhbCBob29rXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdXNlUG9ydGFsPFMsIEE+KFxyXG4gIGtleTogc3RyaW5nLFxyXG4gIGluaXRpYWxTdGF0ZTogUyAmIFJlZHVjZXJTdGF0ZTxSZWR1Y2VyPFMsIEE+PixcclxuICByZWR1Y2VyPzogUmVkdWNlcjxTLCBBPlxyXG4pIHtcclxuICBjb25zdCBjb250ZXh0ID0gZ2V0UG9ydGFsRW50cmllczxzdHJpbmcsIEJlaGF2aW9yU3ViamVjdDxTPj4oKTtcclxuICBjb25zdCBvYnNlcnZhYmxlID0gY29udGV4dC5nZXQoa2V5KSA/PyBuZXcgQmVoYXZpb3JTdWJqZWN0KGluaXRpYWxTdGF0ZSBhcyBTKTtcclxuICBpZiAoIWNvbnRleHQuaGFzKGtleSkpIGNvbnRleHQuc2V0KGtleSwgb2JzZXJ2YWJsZSk7XHJcblxyXG4gIGNvbnN0IGZyYW1lID0gZ2V0UG9ydGFsUmVkdWNlcnM8UywgQT4oKTtcclxuICBjb25zdCBkaXNwYXRjaCA9IGZyYW1lLmdldChvYnNlcnZhYmxlKSA/PyByZWR1Y2VyO1xyXG4gIGlmIChyZWR1Y2VyICYmICFmcmFtZS5oYXMob2JzZXJ2YWJsZSkpIGZyYW1lLnNldChvYnNlcnZhYmxlLCByZWR1Y2VyKTtcclxuXHJcbiAgY29uc3QgW3N0YXRlLCBzZXRTdGF0ZV0gPSB1c2VTdGF0ZShpbml0aWFsU3RhdGUgYXMgUyk7XHJcbiAgY29uc3Qgc3ViUmVmID0gdXNlUmVmPFN1YnNjcmlwdGlvbj4oKTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIHN1YlJlZi5jdXJyZW50ID0gb2JzZXJ2YWJsZS5zdWJzY3JpYmUoc2V0U3RhdGUpO1xyXG4gICAgcmV0dXJuICgpID0+IHN1YlJlZi5jdXJyZW50Py51bnN1YnNjcmliZSgpO1xyXG4gIH0sIFtdKTtcclxuXHJcbiAgY29uc3Qgc2V0dGVyID0gdXBkYXRlU3RhdGU8UywgQT4ob2JzZXJ2YWJsZSwgc3RhdGUsIGRpc3BhdGNoKTtcclxuICByZXR1cm4gW3N0YXRlLCBzZXR0ZXJdO1xyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNBQSxtQkFBMEQ7QUFFMUQsa0JBQThDO0FBUzlDLElBQU0sYUFBYSxDQUFDLE1BQTBCLE9BQU8sTUFBTTtBQVUzRCxTQUFTLFlBQ1AsWUFDQSxXQUNBLFVBQ0E7QUFhQSxRQUFNLFNBQVMsQ0FBQyxVQUFpQztBQUMvQyxlQUNJLFdBQVcsS0FBSyxTQUFTLFdBQVcsS0FBVSxDQUFDLElBQy9DLFdBQVcsS0FBSyxJQUNoQixXQUFXLEtBQUssTUFBTSxTQUFTLENBQUMsSUFDaEMsV0FBVyxLQUFLLEtBQVU7QUFBQSxFQUNoQztBQUNBLFNBQU87QUFDVDtBQWdDTyxTQUFTLFVBQ2QsS0FDQSxjQUNBLFNBQ0E7QUFDQSxRQUFNLFVBQVUsaUJBQTZDO0FBQzdELFFBQU0sYUFBYSxRQUFRLElBQUksR0FBRyxLQUFLLElBQUksNEJBQWdCLFlBQWlCO0FBQzVFLE1BQUksQ0FBQyxRQUFRLElBQUksR0FBRztBQUFHLFlBQVEsSUFBSSxLQUFLLFVBQVU7QUFFbEQsUUFBTSxRQUFRLGtCQUF3QjtBQUN0QyxRQUFNLFdBQVcsTUFBTSxJQUFJLFVBQVUsS0FBSztBQUMxQyxNQUFJLFdBQVcsQ0FBQyxNQUFNLElBQUksVUFBVTtBQUFHLFVBQU0sSUFBSSxZQUFZLE9BQU87QUFFcEUsUUFBTSxDQUFDLE9BQU8sUUFBUSxRQUFJLHVCQUFTLFlBQWlCO0FBQ3BELFFBQU0sYUFBUyxxQkFBcUI7QUFFcEMsOEJBQVUsTUFBTTtBQUNkLFdBQU8sVUFBVSxXQUFXLFVBQVUsUUFBUTtBQUM5QyxXQUFPLE1BQU0sT0FBTyxTQUFTLFlBQVk7QUFBQSxFQUMzQyxHQUFHLENBQUMsQ0FBQztBQUVMLFFBQU0sU0FBUyxZQUFrQixZQUFZLE9BQU8sUUFBUTtBQUM1RCxTQUFPLENBQUMsT0FBTyxNQUFNO0FBQ3ZCOzs7QURuR0EsSUFBSSxRQUFRLE9BQU8sV0FBVyxjQUFjLFNBQVM7QUFDckQsSUFBSSxDQUFDO0FBQU8sUUFBTSxJQUFJLE1BQU0sNEJBQTRCO0FBRXhELElBQUksQ0FBQyxNQUFNLG1CQUFtQjtBQUFHLFFBQU0sb0JBQW9CLG9CQUFJLElBQUk7QUFDNUQsSUFBTSxtQkFBbUIsTUFDOUIsTUFBTTtBQUVSLElBQUksQ0FBQyxNQUFNLG9CQUFvQjtBQUFHLFFBQU0scUJBQXFCLG9CQUFJLFFBQVE7QUFDbEUsSUFBTSxvQkFBb0IsTUFDL0IsTUFBTTsiLAogICJuYW1lcyI6IFtdCn0K