
const supabaseUrl = 'https://qmxzgkibbsfcyzcdjmbf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFteHpna2liYnNmY3l6Y2RqbWJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1Njg3MDUsImV4cCI6MjA4MjE0NDcwNX0.XdONWIPIbzzuZk8RqAQQakfrmhZe_41r3Gsv4x29lMA';

const { createClient } = supabase;
const sb = createClient(supabaseUrl, supabaseKey);

const input = document.getElementById('code-input');
const status = document.getElementById('status');

input.addEventListener('input', (e) => {
    let val = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().substring(0, 3);
    e.target.value = val;

    if (val.length === 3) {
        handleRetrieval(val);
    }
});

async function handleRetrieval(code) {
    showStatus('Retrieving...', 'loading');
    input.disabled = true;

    try {
        const { data, error } = await sb.from('clips').select('*').eq('code', code).maybeSingle();

        if (error || !data) throw new Error('Not found');

        if (new Date() > new Date(data.expires)) {
            throw new Error('Expired');
        }

        if (data.type !== 'text') {
            throw new Error('Not text content');
        }

        await navigator.clipboard.writeText(data.content);
        showStatus('Copied to Clipboard!', 'success');

        setTimeout(() => {
            window.close();
        }, 1200);

    } catch (err) {
        console.error(err);
        let msg = err.message === 'Not found' ? 'Invalid Code' : 'Error';
        if (err.message === 'Not text content') msg = 'File type not supported';

        showStatus(msg, 'error');

        setTimeout(() => {
            input.disabled = false;
            input.value = '';
            input.focus();
            status.classList.remove('visible');
        }, 1500);
    }
}

function showStatus(text, type) {
    status.textContent = text;
    status.className = type + ' visible';
}
