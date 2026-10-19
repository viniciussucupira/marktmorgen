# Path personal goal field correction

The optional personal goal has a stable label, separately associated currency/help text and numeric/decimal keyboard hint. A plain-amount parser refusal is now associated with this field through aria-invalid and aria-describedby, and focus returns to the field. Editing it removes its stale error. The existing parser, goal bounds, server answers and financial/cost rules are unchanged; this is the creator's optional personal goal, not a projection or a plan price.

Synthetic browser tests390/1280 enter a number syntax accepted by the native number field but rejected by the existing plain-amount parser, check no POST, focused invalid field, linked error, correction/clear state, then continue the full prior pending/refusal/uncertainty/navigation/confirmed-save/AA/fit flow. No global assistive-technology certification is claimed.
