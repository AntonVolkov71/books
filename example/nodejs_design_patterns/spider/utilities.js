"use strict";

const urlParse = require('url').parse;
const urlResolve = require('url').resolve;
const slug = require('slug');
const path = require('path');
const cheerio = require('cheerio');

module.exports.urlToFilename = function urlToFilename(url) {
    const parsedUrl = urlParse(url);
    const urlPath = parsedUrl.path.split('/')
        .filter(function(component) {
            return component !== '';
        })
        .map(function(component) {
            return slug(component, { remove: null });
        })
        .join('/');
    let filename = path.join(parsedUrl.hostname, urlPath);
    if(!path.extname(filename).match(/htm/)) {
        filename += '.html';
    }
    return filename;
};

module.exports.getLinkUrl = function getLinkUrl(currentUrl, element) {
    const link = urlResolve(currentUrl, element.attribs.href || "");
    const parsedLink = urlParse(link);
    const currentParsedUrl = urlParse(currentUrl);
    if(parsedLink.hostname !== currentParsedUrl.hostname
        || !parsedLink.pathname) {
        return null;
    }
    return link;
};

module.exports.getPageLinks = function getPageLinks(currentUrl, body) {
    return [].slice.call(cheerio.load(body)('a'))
        .map(function(element) {
            return module.exports.getLinkUrl(currentUrl, element);
        })
        .filter(function(element) {
            return !!element;
        });
};

module.exports.promisify = function(callbackBasedApi) {
    return function promisified() {
        let args = [].slice.call(arguments);
        return new Promise((resolve, reject) => {
            args.push((err, result) => {
                if(err) {
                    return reject(err);
                }
                if(arguments.length <= 2) {
                    resolve(result);
                } else {
                    resolve([].slice.call(arguments, 1));
                }
            });
            callbackBasedApi.apply(null, args);
        });
    }
};