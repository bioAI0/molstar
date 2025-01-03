import showdown, { ShowdownExtension } from 'showdown';

const sameLinkTextExtension: ShowdownExtension = {
    type: 'lang',
    regex: /\[\[([^\|\]]+)\]\]/g,
    replace: '<a href="/$1">$1</a>',
};

const differentLinkTextExtension: ShowdownExtension = {
    type: 'lang',
    regex: /\[\[([^\|]+)\|([^\]]+)\]\]/g,
    replace: '<a href="/$1">$2</a>',
};

const videoExtension: ShowdownExtension = {
    type: 'lang',
    regex: /!\[([^\]]+)\]\(([^)]+)\)/g,
    replace: `<p>$1</p>
<iframe class="responsive-video" width="560" height="315" src="$2"
  frameborder="0" allow="accelerometer; autoplay; clipboard-write;
  encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
</iframe>`,
};

const converter = new showdown.Converter({
    extensions: [videoExtension, sameLinkTextExtension, differentLinkTextExtension],
});

// OR if you need to access .makeHtml() differently (for example, re-exporting a named function):
export function makeHtml(markdown: string): string {
    return converter.makeHtml(markdown);
}
