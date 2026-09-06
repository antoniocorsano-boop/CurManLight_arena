import { ExternalLink, FileText, Landmark, Link2, ShieldCheck } from 'lucide-react';
import {
  INSTITUTE_CURRICULUM_AUTHORITATIVE_SOURCE_COUNT,
  INSTITUTE_CURRICULUM_AUTHORITATIVE_SOURCES,
  INSTITUTE_CURRICULUM_SOURCE_CHAIN,
  INSTITUTE_CURRICULUM_SOURCE_REPERTORY,
} from '../../../domain/curriculum/institute/sourceRegister';

const describeChainRole = (role: string): string => {
  switch (role) {
    case 'CANONICAL_WORKING_BASELINE': return 'baseline curricolare di lavoro';
    case 'CONTROL_ATTACHMENT_NOT_CURRICULUM_BASELINE': return 'allegato di controllo';
    case 'INSTRUCTIONAL_SOURCE_REPERTORY': return 'repertorio delle fonti';
    case 'PRIMARY_CORRECTED_PROVENANCE': return 'fonte primaria di provenienza';
    default: return role;
  }
};

export function InstituteCurriculumSourceRegisterPanel() {
  const institutionalMirrorCount = INSTITUTE_CURRICULUM_AUTHORITATIVE_SOURCES.filter(
    (source) => source.locatorKind === 'INSTITUTIONAL_MIRROR',
  ).length;
  const officialCount = INSTITUTE_CURRICULUM_AUTHORITATIVE_SOURCE_COUNT - institutionalMirrorCount;

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
      data-institute-curriculum-source-register
      data-source-repertory-version={INSTITUTE_CURRICULUM_SOURCE_REPERTORY.version}
    >
      <div className="flex items-start gap-3" data-hcm-level="1">
        <Landmark className="mt-0.5 h-5 w-5 shrink-0 text-indigo-700" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-black text-slate-900">Fonti normative e istituzionali del curricolo</h2>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            {INSTITUTE_CURRICULUM_AUTHORITATIVE_SOURCE_COUNT} fonti tracciate · {officialCount} ufficiali · {institutionalMirrorCount} tramite copia istituzionale.
          </p>
          <p className="mt-1 text-xs font-bold text-amber-800">
            Fonti verificate; validazione professionale del curricolo ancora aperta.
          </p>
        </div>
      </div>

      <details
        className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3"
        data-authoritative-curriculum-sources
        data-hcm-level="2"
      >
        <summary className="cursor-pointer text-sm font-black text-slate-800">
          Consulta le {INSTITUTE_CURRICULUM_AUTHORITATIVE_SOURCE_COUNT} fonti
        </summary>
        <div className="mt-3 space-y-2">
          {INSTITUTE_CURRICULUM_AUTHORITATIVE_SOURCES.map((source) => {
            const official = source.locatorKind === 'OFFICIAL';
            return (
              <details
                key={source.code}
                className="rounded-xl border border-slate-200 bg-white"
                data-curriculum-source-code={source.code}
                data-source-locator-kind={source.locatorKind}
                data-source-verification={source.verificationState}
              >
                <summary className="cursor-pointer list-none px-3 py-3 marker:content-none">
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-xs font-black text-slate-700">{source.code}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold leading-5 text-slate-900">{source.title}</p>
                      <p className={`mt-1 text-xs font-bold ${official ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {official ? 'Fonte ufficiale verificata' : 'Atto verificato — copia di trasmissione'}
                      </p>
                    </div>
                    <ShieldCheck className={`mt-0.5 h-4 w-4 shrink-0 ${official ? 'text-emerald-600' : 'text-amber-600'}`} aria-hidden="true" />
                  </div>
                </summary>

                <div className="border-t border-slate-200 px-3 pb-3 pt-3">
                  <dl className="grid gap-1 text-xs leading-5 text-slate-600">
                    <div><dt className="inline font-bold text-slate-800">Uso nel master: </dt><dd className="inline">{source.roleInMaster}</dd></div>
                    <div><dt className="inline font-bold text-slate-800">Applicabilità: </dt><dd className="inline">{source.applicability}</dd></div>
                  </dl>

                  <a
                    href={source.locator}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800"
                  >
                    {official ? <ExternalLink className="h-4 w-4" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
                    {official ? 'Apri la fonte ufficiale' : 'Apri la copia istituzionale di trasmissione'}
                  </a>

                  <details className="mt-3 border-t border-slate-200 pt-3" data-hcm-level="3">
                    <summary className="cursor-pointer text-xs font-bold text-slate-600">Dati di tracciabilità</summary>
                    <dl className="mt-2 grid gap-1 text-xs leading-5 text-slate-600">
                      <div><dt className="inline font-bold text-slate-800">Ente: </dt><dd className="inline">{source.issuer}</dd></div>
                      <div><dt className="inline font-bold text-slate-800">Data atto: </dt><dd className="inline">{source.actDate}</dd></div>
                      <div><dt className="inline font-bold text-slate-800">Ultima verifica: </dt><dd className="inline">{source.verifiedAt}</dd></div>
                    </dl>
                    {!official && (
                      <p className="mt-2 text-xs leading-5 text-amber-800">
                        Questo collegamento documenta l’atto ministeriale tramite una copia pubblicata da un’istituzione scolastica; Arena non lo presenta come URL ufficiale del Ministero.
                      </p>
                    )}
                  </details>
                </div>
              </details>
            );
          })}
        </div>
      </details>

      <details
        className="mt-3 rounded-xl border border-slate-200 bg-white p-3"
        data-source-document-chain
        data-hcm-level="3"
      >
        <summary className="cursor-pointer text-sm font-bold text-slate-700">Verifica la catena documentale</summary>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {INSTITUTE_CURRICULUM_SOURCE_CHAIN.map((item) => (
            <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3" data-source-chain-role={item.role}>
              <div className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-xs font-black text-indigo-700">{item.id}</p>
                  <p className="mt-1 break-words text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-600">Ruolo: {describeChainRole(item.role)}</p>
                  <p className="mt-1 text-xs text-slate-600">Versione: <span className="font-mono">{item.version}</span></p>
                  <p className="mt-1 break-all text-xs text-slate-600">Drive: <span className="font-mono">{item.driveFileId}</span></p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </details>

      <p className="mt-3 text-xs leading-5 text-slate-500" data-hcm-level="2">
        Verifica della fonte ≠ validazione del contenuto curricolare ≠ decisione istituzionale ≠ curricolo vigente.
      </p>
    </section>
  );
}
