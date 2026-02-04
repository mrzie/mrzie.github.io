import {Decoration, EditorView, ViewPlugin, ViewUpdate} from '@codemirror/view';
import {RangeSetBuilder} from '@codemirror/state';
import {syntaxTree} from '@codemirror/language';

function buildAllMarks(view: EditorView) {
    const builder = new RangeSetBuilder<Decoration>();
    const {doc} = view.state;
    const tree = syntaxTree(view.state);
    tree.iterate({
        from: 0,
        to: doc.length,
        enter: (node) => {
            const name = node.name;
            if (name.endsWith('Mark')) {
                // 将节点名转为类名，例如 EmphasisMark -> cm-emphasisMark
                const className = `cm-${name[0].toLowerCase()}${name.slice(1)}`;
                builder.add(node.from, node.to, Decoration.mark({class: className}));
            }
        },
    });
    return builder.finish();
}

export const headingMarkExtension = ViewPlugin.fromClass(
    class {
        decorations: ReturnType<typeof buildAllMarks>;

        constructor(readonly view: EditorView) {
            this.decorations = buildAllMarks(view);
        }

        update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged) {
                this.decorations = buildAllMarks(this.view);
            }
        }
    },
    {
        decorations: (v) => v.decorations,
    }
);
