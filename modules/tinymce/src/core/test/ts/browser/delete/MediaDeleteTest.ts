import { ApproxStructure, Keyboard, Keys } from '@ephox/agar';
import { before, context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.delete.MediaDeleteTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ], true);

  const assertEmptyEditorStructure = (editor: Editor) => TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) =>
    s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.element('br', {
              attrs: {
                'data-mce-bogus': str.is('1')
              }
            })
          ]
        })
      ]
    })
  ));

  Arr.each([
    { type: 'video', content: '<video controls="controls"><source src="custom/video.mp4" /></video>', skip: false },
    { type: 'audio', content: '<audio controls="controls"><source src="custom/audio.mp3" /></audio>', skip: false },
    // Firefox won't render without a valid embed/object, so skip
    { type: 'embed', content: '<embed src="custom/video.mp4" />', skip: Env.browser.isFirefox() },
    { type: 'object', content: '<object data="custom/file.pdf"></object>', skip: Env.browser.isFirefox() }
  ], (test) => {
    const { type, content } = test;

    context(`${type} media`, () => {
      before(function () {
        if (test.skip) {
          this.skip();
        }
      });

      it('TINY-4211: Backspace selected node with padd editor', () => {
        const editor = hook.editor();
        editor.setContent(content);
        TinySelections.select(editor, type, []);
        Keyboard.activeKeystroke(TinyDom.document(editor), Keys.backspace(), { });
        assertEmptyEditorStructure(editor);
      });

      it('TINY-4211: Delete selected node with padd editor', () => {
        const editor = hook.editor();
        editor.setContent(content);
        TinySelections.select(editor, type, []);
        Keyboard.activeKeystroke(TinyDom.document(editor), Keys.delete(), { });
        assertEmptyEditorStructure(editor);
      });

      it('TINY-4211: Backspace after media', () => {
        const editor = hook.editor();
        editor.setContent(`<p>before${content}</p>`);
        TinySelections.select(editor, type, []);
        Keyboard.activeKeystroke(TinyDom.document(editor), Keys.right(), { });
        Keyboard.activeKeystroke(TinyDom.document(editor), Keys.backspace(), { });
        TinyAssertions.assertContent(editor, '<p>before</p>');
      });

      it('TINY-4211: Delete before media', () => {
        const editor = hook.editor();
        editor.setContent(`<p>${content}after</p>`);
        TinySelections.select(editor, type, []);
        Keyboard.activeKeystroke(TinyDom.document(editor), Keys.left(), { });
        Keyboard.activeKeystroke(TinyDom.document(editor), Keys.delete(), { });
        TinyAssertions.assertContent(editor, '<p>after</p>');
      });
    });
  });
});
