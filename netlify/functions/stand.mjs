import { getStore } from '@netlify/blobs';

/**
 * De gedeelde stand van de afvinklijsten.
 *
 * GET  /api/stand?lijst=features
 *      → { vink: { "cms-blokken": true }, notitie: { "cms": "…" }, bijgewerkt }
 *
 * POST /api/stand   { lijst, soort: "vink" | "notitie", veld, waarde }
 *      → { ok: true, bijgewerkt }
 *
 * Per véld schrijven, niet per document. Wie het hele blok terugstuurt,
 * overschrijft wat een ander intussen aanzette — en dat gebeurt geruisloos,
 * precies wanneer twee mensen samen door een lijst lopen. Eén regel per keer
 * betekent dat alleen wie hetzelfde vakje aanraakt elkaar kan overschrijven.
 */

const STORE = 'checklists';
const LIJST = /^[a-z0-9][a-z0-9-]{0,39}$/;
const VELD  = /^[A-Za-z0-9][A-Za-z0-9-]{0,59}$/;
const MAX_NOTITIE = 4000;
const MAX_POGINGEN = 5;

/** Pure samenvoeging, apart zodat hij zonder Netlify te testen is. */
export function samenvoegen(stand, wijziging) {
  const nieuw = {
    vink: { ...(stand?.vink || {}) },
    notitie: { ...(stand?.notitie || {}) },
  };
  const { soort, veld, waarde } = wijziging;
  if (soort === 'vink') {
    if (waarde === true) nieuw.vink[veld] = true;
    else delete nieuw.vink[veld];
  } else {
    const tekst = String(waarde ?? '').slice(0, MAX_NOTITIE);
    if (tekst.trim()) nieuw.notitie[veld] = tekst;
    else delete nieuw.notitie[veld];
  }
  nieuw.bijgewerkt = new Date().toISOString();
  return nieuw;
}

/** Wat er terugkomt als er nog nooit iets is opgeslagen. */
const leeg = () => ({ vink: {}, notitie: {}, bijgewerkt: null });

const antwoord = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

function winkel() {
  // Standaard is Blobs eventually consistent: een wijziging mag er tot een
  // minuut over doen om overal zichtbaar te zijn. Voor een lijst die je
  // samen tijdens een gesprek invult is dat te traag.
  return getStore({ name: STORE, consistency: 'strong' });
}

export default async (request) => {
  const url = new URL(request.url);

  if (request.method === 'GET') {
    const lijst = url.searchParams.get('lijst') || '';
    if (!LIJST.test(lijst)) return antwoord({ fout: 'onbekende lijst' }, 400);
    const stand = await winkel().get(lijst, { type: 'json' });
    return antwoord(stand || leeg());
  }

  if (request.method === 'POST') {
    let body;
    try { body = await request.json(); }
    catch { return antwoord({ fout: 'geen geldige json' }, 400); }

    const { lijst, soort, veld } = body || {};
    if (!LIJST.test(lijst || '')) return antwoord({ fout: 'onbekende lijst' }, 400);
    if (soort !== 'vink' && soort !== 'notitie') return antwoord({ fout: 'onbekend soort' }, 400);
    if (!VELD.test(veld || '')) return antwoord({ fout: 'onbekend veld' }, 400);
    if (soort === 'notitie' && typeof body.waarde !== 'string' && body.waarde !== null) {
      return antwoord({ fout: 'notitie moet tekst zijn' }, 400);
    }

    const store = winkel();
    // Lezen, één veld wijzigen, terugschrijven — maar alleen als er intussen
    // niemand anders heeft geschreven. Zo niet: opnieuw lezen en het nog eens
    // proberen. Dat is de enige plek waar twee schrijvers elkaar raken.
    for (let poging = 0; poging < MAX_POGINGEN; poging++) {
      const huidig = await store.getWithMetadata(lijst, { type: 'json' }).catch(() => null);
      const stand = samenvoegen(huidig?.data, { soort, veld, waarde: body.waarde });
      const voorwaarde = huidig?.etag ? { onlyIfMatch: huidig.etag } : { onlyIfNew: true };
      const uitkomst = await store.setJSON(lijst, stand, voorwaarde);
      // Oudere versies van de bibliotheek geven niets terug; dan is er
      // geschreven zonder voorwaarde en zijn we klaar.
      if (!uitkomst || uitkomst.modified !== false) {
        return antwoord({ ok: true, bijgewerkt: stand.bijgewerkt });
      }
    }
    return antwoord({ fout: 'te druk, probeer opnieuw' }, 409);
  }

  return antwoord({ fout: 'alleen GET en POST' }, 405);
};

export const config = { path: '/api/stand' };
