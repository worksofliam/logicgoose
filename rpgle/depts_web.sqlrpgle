

        Ctl-Opt DFTACTGRP(*no);
        //live-error:crtsqlrpgi

      //---------------------------------------------------------------*
      *
          Dcl-S Index Int(5);

          Dcl-Ds Department ExtName('DEPARTMENT') Alias Qualified;
          End-Ds;
          
          Dcl-Ds outputRows Dim(50) Qualified;
            id Like(Department.DEPTNO);
            name Like(Department.DEPTNAME);
          End-Ds;


        //------------------------------------------------------------reb04
          index = 0;
          LoadSubfile();

          EXEC SQL SET RESULT SETS ARRAY :outputRows for :index ROWS;

          *INLR = *ON;
          Return;

          Dcl-Proc LoadSubfile;
            Dcl-S lCount  Int(5);
            Dcl-S Action  Char(1);
            Dcl-S LongAct Char(3);

            EXEC SQL DECLARE deptCur CURSOR FOR
              SELECT DEPTNO, DEPTNAME
              FROM SAMPLE.DEPARTMENT;

            EXEC SQL OPEN deptCur;

            if (sqlstate = '00000');

              dou (sqlstate <> '00000');
                EXEC SQL
                  FETCH NEXT FROM deptCur
                  INTO :Department.DEPTNO, :Department.DEPTNAME;

                if (sqlstate = '00000');

                  index += 1;
                  outputRows(index).id = Department.DEPTNO;
                  outputRows(index).name = Department.DEPTNAME;
                endif;
              enddo;

            endif;

            EXEC SQL CLOSE deptCur;

          End-Proc;