(function () {
    const context = SillyTavern.getContext();

    function showYoutubePopup() {
        const popupHtml = `
            <div id="youtube_popup" class="popup">
                <h3>Summarize YouTube Video</h3>
                <input type="text" id="youtube_url" placeholder="YouTube URL" class="text_pole">
                <input type="text" id="youtube_prompt" placeholder="Prompt" class="text_pole">
                <input type="number" id="youtube_fps" placeholder="FPS (optional)" class="text_pole">
                <button id="youtube_submit" class="menu_button">Summarize</button>
            </div>
        `;
        const popup = new context.Popup(popupHtml, 'text', '', { wider: true, large: true });
        popup.show();

        $('#youtube_submit').on('click', async function () {
            const url = $('#youtube_url').val();
            const prompt = $('#youtube_prompt').val();
            const fps = $('#youtube_fps').val();

            if (!url || !prompt) {
                toastr.error('Please enter a URL and a prompt.');
                return;
            }

            const videoPart = {
                fileData: {
                    fileUri: url,
                },
            };

            if (fps) {
                videoPart.videoMetadata = { fps: Number(fps) };
            }

            const message = {
                name: 'Assistant',
                is_user: false,
                is_system: true,
                send_date: context.getMessageTimeStamp(),
                mes: `Summarizing video...`,
                extra: {
                    youtube_summarize: {
                        parts: [
                            { text: prompt },
                            videoPart,
                        ],
                    },
                },
            };

            context.chat.push(message);
            context.addOneMessage(message);
            popup.complete(context.POPUP_RESULT.AFFIRMATIVE);
            context.Generate('normal');
        });
    }

    function addYoutubeButton() {
        const youtubeButton = $('<div id="youtube_summarize" class="fa-brands fa-youtube interactable" title="Summarize a YouTube video" data-i18n="[title]Summarize a YouTube video" tabindex="0"></div>');
        youtubeButton.on('click', showYoutubePopup);
        $('#rightSendForm').prepend(youtubeButton);
    }

    globalThis.geminiProFeaturesInterceptor = async function(chat, contextSize, abort, type) {
        const lastMessage = chat[chat.length - 1];
        if (lastMessage?.extra?.youtube_summarize) {
            const parts = lastMessage.extra.youtube_summarize.parts;
            chat.splice(chat.length - 1, 1, { role: 'user', parts: parts });
        }

        if (context.settings.openai_enable_web_search) {
            for (const message of chat) {
                if (message.role === 'user') {
                    if (!message.tools) {
                        message.tools = [];
                    }
                    message.tools.push({ googleSearch: {} });
                }
            }
        }
    }

    $(document).ready(function () {
        addYoutubeButton();
    });
})();
