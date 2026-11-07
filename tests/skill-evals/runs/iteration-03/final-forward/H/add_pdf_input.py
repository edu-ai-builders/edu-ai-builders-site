from pathlib import Path
import json
OUT=Path('/private/tmp/edu-skill-evals-20261012/final-forward');folder=OUT/'H/inputs';pdf=folder/'family-worksheet.pdf'
# Independently authored local PDF fixture. It is not extracted or viewed in this task.
stream=b'BT /F1 14 Tf 72 720 Td (Family worksheet evaluation fixture) Tj ET'
objects=[b'<< /Type /Catalog /Pages 2 0 R >>',b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',b'<< /Length '+str(len(stream)).encode()+b' >>\nstream\n'+stream+b'\nendstream']
data=b'%PDF-1.4\n';offsets=[0]
for i,obj in enumerate(objects,1):offsets.append(len(data));data+=str(i).encode()+b' 0 obj\n'+obj+b'\nendobj\n'
xref=len(data);data+=b'xref\n0 6\n0000000000 65535 f \n'
for off in offsets[1:]:data+=f'{off:010d} 00000 n \n'.encode()
data+=b'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+str(xref).encode()+b'\n%%EOF\n';pdf.write_bytes(data)
p=folder/'pdf-no-extractor.json';o=json.loads(p.read_text());o['prompt']='用提供的 family-worksheet.pdf 规划一个适合家庭的中英双语手机数学练习产品。没有 PDF 提取器，也不能查看 PDF 内容；先交一份有用的计划，第一版不要付费模型，最多三个候选，先尝试后提示。';o['raw_material']={'filename':'family-worksheet.pdf','path':str(pdf),'fixture_origin':'independently authored PDF for boundary case; bytes supplied but not extracted or viewed','file_bytes_available':True,'extractor_available':False,'page_text_available':False};p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
