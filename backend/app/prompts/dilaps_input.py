DILAPS_INPUT = """
The template file is called `example_final_dilaps.xlsx`, a Schedule of Dilapidations report in spreadsheet format with several worksheets.

The workbook structure is as follows:
- A cover worksheet (“Front Pages”) containing the logo and job details.
- Several worksheets representing different surveyed areas of the site.
- Each area sheet includes columns:
  - **Item** – sequential item number (e.g. 1.1, 1.2, …, 2.3).
  - **Lease** – corresponding lease clause (e.g. One, Two, Three, Four).
  - **Want of repair** – description of the required repair in formal surveying tone, or a heading/sub-section label.
  - **Remedy** – description of the required works to address the want of repair.
  - **U** – unit of measurement (e.g. m², No, m).
  - **Q** – quantity of units (float).
  - **R** – rate per unit (£).
  - **£** – cost, computed by an Excel formula (Q × R).

Each worksheet ends with a total cost row summing the column of costs.  
The final worksheet, “Collection”, summarises totals per section and the overall total.

The provided context includes:
- The relevant lease clauses.
- Site survey notes.
- A subset of inspection photographs.
- The Excel template `example_final_dilaps.xlsx` (file_id: `file-3HymGE5LRVRLTrRAGSmfPt`).

**Editing requirements**
- Perform all modifications directly on the provided template using the Python tool.  
- Preserve existing formatting, layout, and formulas.  
- Replace old data with new schedule entries based on the provided notes.  
- Update any relevant cover page fields to reflect the new project details.  
- Do not create a new workbook or change sheet names.

**Final output requirement**
- Save over the provided template path within the code interpreter container.  

"""

