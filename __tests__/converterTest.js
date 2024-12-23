const converter = require('../src/converter');

describe('makeHtml', () => {
    it('should convert html', () => {
        const input = 'test';
        const expected = '<p>test</p>';
        const result = converter.makeHtml(input);
        expect(result).toEqual(expected);
    });

    it('should convert links', () => {
        const input = '[[gp100]]-';
        const expected = '<p><a href="/gp100">gp100</a>-</p>';
        const result = converter.makeHtml(input);
        expect(result).toEqual(expected);
    });

    it('should convert links with different text', () => {
        const input = '[[test0|test1]]';
        const expected = '<p><a href="/test0">test1</a></p>';
        const result = converter.makeHtml(input);
        expect(result).toEqual(expected);
    });

    it('should convert complex text', () => {
        const input = 'Redirects [[t-cell|T cells]] to kill [[gp100]]-expressing cells.';
        const expected = '<p>Redirects <a href="/t-cell">T cells</a> to kill <a href="/gp100">gp100</a>-expressing cells.</p>';
        const result = converter.makeHtml(input);
        expect(result).toEqual(expected);
    });

    it('should convert really complex text', () => {
        const input = 'Performs less well than [[alphafold2]].  [[alphafold2]] performs significantly worse than [[alphafold3]]';
        const expected = '<p>Performs less well than <a href="/alphafold2">alphafold2</a>.  <a href="/alphafold2">alphafold2</a> performs significantly worse than <a href="/alphafold3">alphafold3</a></p>';
        const result = converter.makeHtml(input);
        expect(result).toEqual(expected);
    });

    it('should convert really really complex text', () => {
        const input = 'After being laid off from Facebook [[ex-meta|ex-meta]] [[meta-axed|meta-axed]] they started a new company';
        const expected = '<p>After being laid off from Facebook <a href="/ex-meta">ex-meta</a> <a href="/meta-axed">meta-axed</a> they started a new company</p>';
        const result = converter.makeHtml(input);
        expect(result).toEqual(expected);
    });

// Simulating 500 million years of evolution with a language model

// # tl;dr;tl;dr

// Revolutionary protein LLM that combines sequence, structure, function in one generative model.

// Performs less well than [[alphafold2]].

// [[alphafold2]] performs significantly worse than [[alphafold3]].
    
    it('should convert really really very complex text', () => {
        const input = 'Simulating 500 million years of evolution with a language model\n\n# tl;dr;tl;dr\n\nRevolutionary protein LLM that combines sequence, structure, function in one generative model.\n\nPerforms less well than [[alphafold2]].\n\n[[alphafold2]] performs significantly worse than [[alphafold3]].';
        const expected = '<p>Simulating 500 million years of evolution with a language model</p>\n<h1 id="tldrtldr">tl;dr;tl;dr</h1>\n<p>Revolutionary protein LLM that combines sequence, structure, function in one generative model.</p>\n<p>Performs less well than <a href="/alphafold2">alphafold2</a>.</p>\n<p><a href="/alphafold2">alphafold2</a> performs significantly worse than <a href="/alphafold3">alphafold3</a>.</p>';
        const result = converter.makeHtml(input);
        expect(result).toEqual(expected);
    });



    it('should embed YouTube video', () => {
        const input = '![test1](test2)';
        const expected = '<p>test1</p>\n<iframe class="responsive-video" width="560" height="315" src="test2" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
        const result = converter.makeHtml(input);
        expect(result).toEqual(expected);
    });
    
});
