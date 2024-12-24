const showdown = require('showdown');

const sameLinkTextExtension = {
    type: 'lang',
    regex: /\[\[([^\|\]]+)\]\]/g,
    replace: '<a href="/$1">$1</a>',
};

const differentLinkTextExtension = {
    type: 'lang',
    regex: /\[\[([^\|]+)\|([^\]]+)\]\]/g,
    replace: '<a href="/$1">$2</a>',
};

const videoExtension = {
    type: 'lang',
    regex: /!\[([^\]]+)\]\(([^)]+)\)/g,
    replace: '<p>$1</p>\n<iframe class="responsive-video" width="560" height="315" src="$2" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
}

const converter = new showdown.Converter({
    extensions: [videoExtension, sameLinkTextExtension, differentLinkTextExtension],
});

module.exports = converter;
