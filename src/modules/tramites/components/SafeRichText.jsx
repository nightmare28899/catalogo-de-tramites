import { Fragment } from "react";

// Minimal markup: **bold** and lines starting with "- " as bullet lists.
// Output is built with React elements only, so raw input is never injected as HTML.
function renderInline(line) {
    return line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") && part.length > 4
            ? <strong key={i}>{part.slice(2, -2)}</strong>
            : <Fragment key={i}>{part}</Fragment>);
}

const SafeRichText = ({ text }) => {
    const blocks = [];
    let list = null;
    String(text ?? "").split("\n").forEach((raw, i) => {
        const line = raw.trimEnd();
        if (line.startsWith("- ")) {
            if (!list) { list = []; blocks.push({ type: "ul", items: list, key: i }); }
            list.push(line.slice(2));
        } else {
            list = null;
            if (line.trim()) blocks.push({ type: "p", text: line, key: i });
        }
    });
    return (
        <div className="mq-richtext">
            {blocks.map((b) => b.type === "ul"
                ? <ul key={b.key}>{b.items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}</ul>
                : <p key={b.key}>{renderInline(b.text)}</p>)}
        </div>
    );
};

export default SafeRichText;
