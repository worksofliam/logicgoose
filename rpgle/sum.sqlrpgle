**FREE
//live-error:crtsqlrpgi

Dcl-Pi SUM;
  numa int(10);
  numb int(10);
End-Pi;

Dcl-Ds Results Qualified Dim(1);
  Result int(10);
End-ds;

Results(1).result = numa * numb;

Exec SQL Set Result Sets Array :Results For 1 Rows;

Return;