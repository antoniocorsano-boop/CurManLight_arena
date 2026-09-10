import manifest from '../data/departmentCurriculumV31.json';
import sections01to06 from '../data/departmentCurriculumV31.sections-01-06.json';
import section07 from '../data/departmentCurriculumV31.section-07.json';
import section08 from '../data/departmentCurriculumV31.section-08.json';
import section09 from '../data/departmentCurriculumV31.section-09.json';
import sections10to16 from '../data/departmentCurriculumV31.sections-10-16.json';

type CurriculumBlock = {
  type: 'paragraph' | 'heading2' | 'heading3' | 'bullet' | 'number' | 'note' | 'table';
  text?: string;
  rows?: string[][];
};

export type DepartmentCurriculumSection = {
  id: string;
  number: number;
  title: string;
  blocks: CurriculumBlock[];
};

export const DEPARTMENT_CURRICULUM_MANIFEST = manifest;

export const DEPARTMENT_CURRICULUM_SECTIONS: DepartmentCurriculumSection[] = [
  ...sections01to06,
  ...section07,
  ...section08,
  ...section09,
  ...sections10to16,
] as DepartmentCurriculumSection[];

function PublicationTable({ rows }: { rows: string[][] }) {
  if (rows.length === 1 && rows[0]?.length === 1) {
    return (
      <aside className="my-5 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-sm leading-6 text-slate-700">
        {rows[0][0].split('\n').map((line, index) => (
          <span key={`${index}-${line}`} className={index === 0 ? 'block font-bold text-slate-900' : 'block'}>{line}</span>
        ))}
      </aside>
    );
  }

  return (
    <div className="my-6 max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white" data-curriculum-publication-table>
      <table className="min-w-[720px] w-full border-collapse text-left text-sm leading-5">
        <thead className="bg-slate-100 text-slate-800">
          <tr>
            {rows[0]?.map((cell, index) => (
              <th key={`${index}-${cell}`} scope="col" className="border-b border-r border-slate-200 px-3 py-3 align-top font-bold last:border-r-0">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(1).map((row, rowIndex) => (
            <tr key={`${rowIndex}-${row.join('|')}`} className="border-b border-slate-100 last:border-b-0">
              {row.map((cell, cellIndex) => (
                <td key={`${cellIndex}-${cell}`} className={`border-r border-slate-100 px-3 py-3 align-top text-slate-700 last:border-r-0 ${cellIndex === 0 ? 'font-semibold text-slate-900' : ''}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DepartmentCurriculumPublication({ section }: { section: DepartmentCurriculumSection }) {
  let orderedItemNumber = 0;

  return (
    <div data-curriculum-publication-content data-source-section={section.number}>
      {section.blocks.map((block, index) => {
        const key = `${section.id}-${index}`;
        if (block.type === 'heading2') {
          return <h3 key={key} className="mb-2 mt-7 text-lg font-black leading-snug text-slate-950 first:mt-0 sm:text-xl">{block.text}</h3>;
        }
        if (block.type === 'heading3') {
          return <h4 key={key} className="mb-2 mt-6 text-base font-bold leading-snug text-slate-900 sm:text-lg">{block.text}</h4>;
        }
        if (block.type === 'paragraph') {
          return <p key={key} className="my-3 text-[15px] leading-7 text-slate-700 sm:text-base">{block.text}</p>;
        }
        if (block.type === 'note') {
          return <p key={key} className="my-4 rounded-xl border-l-4 border-indigo-300 bg-indigo-50/60 px-4 py-3 text-sm leading-6 text-slate-700">{block.text}</p>;
        }
        if (block.type === 'bullet') {
          return <p key={key} className="my-2 pl-5 text-[15px] leading-7 text-slate-700 before:-ml-4 before:mr-2 before:content-['•'] sm:text-base">{block.text}</p>;
        }
        if (block.type === 'number') {
          orderedItemNumber += 1;
          return <p key={key} className="my-2 flex gap-3 text-[15px] leading-7 text-slate-700 sm:text-base"><span className="font-bold text-indigo-700">{orderedItemNumber}.</span><span>{block.text}</span></p>;
        }
        if (block.type === 'table' && block.rows) {
          return <PublicationTable key={key} rows={block.rows} />;
        }
        return null;
      })}
    </div>
  );
}
