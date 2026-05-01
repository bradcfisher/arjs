
; 0000 L0a00 @8000 [exe]
* = $8000

8000: a9 40     INIT_IRQS       LDA #$40          ; Set low byte of Break key interrupt vector to $40
8002: 8d 36 02                  STA BRKKY         ;     (default is $E754, so updates to $E740) - see $801b below
8005: a9 00                     LDA #$00          ; Set A = 0
8007: 8d 0e d2                  STA IRQEN         ; Disable IRQs
800a: 8d 0e d4                  STA NMIEN         ; Disable Non-Maskable IRQs (VBI, DLI)
800d: 8d 2f 02                  STA SDMCTL        ; Disable DMA / Antic processing
8010: 8d 56 02                  STA UNK_BYTE_0256  ;   $256 is also LINBUF+15
8013: aa                        TAX               ; Set X = 0
8014: 95 00     loc_8014        STA LINZBS,X      ; Zero out all
8016: e8                        INX               ;     page 0
8017: d0 fb                     BNE loc_8014      ;     bytes
8019: a9 07                     LDA #$07          ; Set high byte of Break key interrupt
801b: 8d 37 02                  STA BRKKY+1       ;     vector to $07 (e.g. $0740)
801e: a9 97                     LDA #$97          ; Set POKEY serial bus
8020: 8d 0e 02                  STA VSEROC        ;     transmit complete
8023: a9 22                     LDA #$22          ;     interrupt vector
8025: 8d 0f 02                  STA VSEROC+1      ;     to $2297
8028: a9 4f                     LDA #$4f          ; Set POKEY serial I/O
802a: 8d 0c 02                  STA VSEROR        ;     transmit ready
802d: a9 22                     LDA #$22          ;     interrupt vetor
802f: 8d 0d 02                  STA VSEROR+1      ;     to $224f
8032: a9 e7                     LDA #$e7          ; Set POKEY serial I/O
8034: 8d 0a 02                  STA VSERIN        ;     bus receive data ready
8037: a9 21                     LDA #$21          ;     interrupt vector
8039: 8d 0b 02                  STA VSERIN+1      ;     to $21e7
803c: a9 ac                     LDA #$ac          ; Set the IRQ immediate
803e: 8d 16 02                  STA VIMIRQ        ;     vector
8041: a9 22                     LDA #$22          ;     to
8043: 8d 17 02                  STA VIMIRQ+1      ;     $22AC
8046: a9 53                     LDA #$53          ; Set the
8048: 8d 08 02                  STA VKEYBD        ;    POKEY keyboard
804b: a9 26                     LDA #$26          ;    interrupt vector
804d: 8d 09 02                  STA VKEYBD+1      ;    to $2653
8050: a9 9d                     LDA #$9d          ; Set the
8052: 8d 54 02                  STA SUB_0254_VEC  ;     ???
8055: a9 19                     LDA #$19          ;     vector
8057: 8d 55 02                  STA SUB_0254_VEC+1 ;    to $199D
805a: a9 47                     LDA #$47          ; Set the
805c: 8d 22 02                  STA VVBLKI        ;     VBLANK immediate
805f: a9 23                     LDA #$23          ;     interrupt vector
8061: 8d 23 02                  STA VVBLKI+1      ;     to $2347
8064: 20 9e 81                  JSR sub_819e      ;
8067: ad 58 02                  LDA LINBUF+17     ;
806a: 0a                        ASL               ;
806b: 2a                        ROL               ;
806c: 2a                        ROL               ;
806d: 29 03                     AND #$03          ;
806f: 20 58 81                  JSR sub_8158      ;
8072: a9 40                     LDA #$40          ; Enable Non-Maskable
8074: 8d 0e d4                  STA NMIEN         ;     VBI Interrupts
8077: ad 36 02                  LDA BRKKY         ; ?? Still $40 at this point ??
807a: 8d 0e d2                  STA IRQEN         ; ?? If so, it would enable VKEYBD interrupts ??
807d: 60                        RTS               ; Return to caller

; Entry point for system initialization
807e: 20 00 80  KERNEL_ENTRY    JSR INIT_IRQS     ; Invoke IRQ initialization
8081: a9 14                     LDA #$14          ; Set CHBASE (character set font)
8083: 8d 09 d4                  STA CHBASE        ;     to $14 (20) (e.g. font is at $1400)
8086: 20 bc 80                  JSR sub_80bc      ;
8089: 20 9f 80                  JSR sub_809f      ;
808c: a9 00                     LDA #$00          ;
808e: 20 0d 1a                  JSR $1a0d         ;
8091: a9 40                     LDA #$40          ;
8093: 8d 36 02                  STA BRKKY         ;
8096: 8d 0e d2                  STA IRQEN         ;
8099: 20 d2 80                  JSR sub_80d2      ;
809c: 4c c6 2e                  JMP $2ec6         ;

809f: a2 02     sub_809f        LDX #$02          ;
80a1: a9 00                     LDA #$00          ;
80a3: 9d c1 18  loc_80a3        STA UNK_TBL_18C1,X  ;
80a6: 9d c4 18                  STA $18c4,X       ;
80a9: 9d c7 18                  STA $18c7,X       ;
80ac: ca                        DEX               ;
80ad: 10 f4                     BPL loc_80a3      ;
80af: 85 1f                     STA PTEMP         ;
80b1: 85 20                     STA ICHIDZ        ;
80b3: 85 21                     STA ICDNOZ        ;
80b5: 85 25                     STA ICBAHZ        ;
80b7: 85 24                     STA ICBALZ        ;
80b9: 85 26                     STA ICPTLZ        ;
80bb: 60                        RTS               ;

80bc: a9 07     sub_80bc        LDA #$07          ;
80be: 8d 00 19                  STA $1900         ;
80c1: a9 00                     LDA #$00          ;
80c3: 8d 65 02                  STA LINBUF+30     ;
80c6: 85 2e                     STA ICAX5Z        ;
80c8: 8d ff 18                  STA $18ff         ;
80cb: 85 2f                     STA CIOCHR        ;
80cd: a9 ff                     LDA #$ff          ;
80cf: 85 30                     STA STATUS        ;
80d1: 60                        RTS               ;

80d2: a2 1f     sub_80d2        LDX #$1f          ;
80d4: bd 6a 81  loc_80d4        LDA dat_816a,X    ;
80d7: 9d 7c 19                  STA $197c,X       ;
80da: ca                        DEX               ;
80db: 10 f7                     BPL loc_80d4      ;
80dd: 20 5d 24                  JSR $245d         ;
80e0: a2 03     loc_80e0        LDX #$03          ;
80e2: 86 06                     STX TRAMSZ        ;
80e4: a6 06     loc_80e4        LDX TRAMSZ        ;
80e6: a9 ff                     LDA #$ff          ;
80e8: 9d 4e 02                  STA LINBUF+7,X    ;
80eb: e8                        INX               ;
80ec: 8a                        TXA               ;
80ed: 29 0f                     AND #$0f          ;
80ef: 09 30                     ORA #$30          ;
80f1: 8d 30 02                  STA SDLST         ;
80f4: 20 a3 24                  JSR $24a3         ;
80f7: 30 0b                     BMI loc_8104      ;
80f9: a6 06                     LDX TRAMSZ        ;
80fb: bd 8a 81                  LDA loc_818a,X    ;
80fe: 9d 98 19                  STA $1998,X       ;
8101: fe 4e 02                  INC LINBUF+7,X    ;
8104: c6 06     loc_8104        DEC TRAMSZ        ;
8106: 10 dc                     BPL loc_80e4      ;
8108: bd 4e 02                  LDA LINBUF+7,X    ;
810b: 30 d3                     BMI loc_80e0      ;
810d: a9 31                     LDA #$31          ;
810f: 8d 30 02                  STA SDLST         ;
8112: a9 04                     LDA #$04          ;
8114: 85 06                     STA TRAMSZ        ;
8116: a9 80                     LDA #$80          ;
8118: 85 09                     STA BOOT          ;
811a: a9 02                     LDA #$02          ;
811c: 85 0a                     STA DOSVEC        ;
811e: a9 02                     LDA #$02          ;
8120: 8d 01 25                  STA $2501         ;
8123: a9 00                     LDA #$00          ;
8125: 8d 02 25                  STA $2502         ;
8128: ad 01 25  loc_8128        LDA $2501         ;
812b: 8d 32 02                  STA SSKCTL        ;
812e: ad 02 25                  LDA $2502         ;
8131: 8d 33 02                  STA $0233         ;
8134: 20 8e 24  loc_8134        JSR $248e         ;
8137: 30 fb                     BMI loc_8134      ;
8139: a0 00                     LDY #$00          ;
813b: b9 00 01  loc_813b        LDA $0100,Y       ;
813e: 91 09                     STA (BOOT),Y      ;
8140: c8                        INY               ;
8141: 10 f8                     BPL loc_813b      ;
8143: a5 09                     LDA BOOT          ;
8145: 18                        CLC               ;
8146: 69 80                     ADC #$80          ;
8148: 85 09                     STA BOOT          ;
814a: 90 02                     BCC loc_814e      ;
814c: e6 0a                     INC DOSVEC        ;
814e: ee 01 25  loc_814e        INC $2501         ;
8151: c6 06                     DEC TRAMSZ        ;
8153: d0 d3                     BNE loc_8128      ;
8155: 4c d8 27                  JMP $27d8         ;

8158: 0a        sub_8158        ASL               ;
8159: 0a                        ASL               ;
815a: aa                        TAX               ;
815b: a0 00                     LDY #$00          ;
815d: bd 8e 81  loc_815d        LDA dat_818e,X    ;
8160: 99 6a 81                  STA dat_816a,Y    ;
8163: e8                        INX               ;
8164: c8                        INY               ;
8165: c0 04                     CPY #$04          ;
8167: 90 f4                     BCC loc_815d      ;
8169: 60                        RTS               ;

816a: 20 20 20  dat_816a        JSR $2020         ;
816d: 20 20 53                  JSR $5320         ;   S
8170: 79 73 74                  ADC $7473,Y       ; yst
8173: 65 6d                     ADC BUFSTR+1      ; em
8175: 20 49 6e                  JSR $6e49         ;  In
8178: 69 74                     ADC #$74          ; it
817a: 69 61                     ADC #$61          ; ia
817c: 6c 69 7a                  JMP ($7a69)       ; liz
817f: 61 74                     ADC (ENDPT,X)     ; at
8181: 69 6f                     ADC #$6f          ; io
8183: 6e 20 20                  ROR $2020         ; n
8186: 20 20 20                  JSR $2020         ;
8189: 20 31 32                  JSR $3231         ;  12
818c: 33 34                     .BYTE $33,$34     ; 34
818e: 20 34 38  dat_818e        JSR $3834         ;  48
8191: 4b                        .BYTE $4b         ; K
8192: 20 3f 3f                  JSR $3f3f         ;  ??
8195: 4b                        .BYTE $4b         ; K
8196: 20 36 34                  JSR $3436         ;  64
8199: 4b                        .BYTE $4b         ; K
819a: 31 32                     AND (BUFRLO),Y    ; 12
819c: 38                        SEC               ; 8
819d: 4b                        .BYTE $4b         ; K

819e: 78        sub_819e        SEI               ; Set interrupt disable status
819f: a9 00                     LDA #$00          ; Store 0
81a1: 8d 58 02                  STA LINBUF+17     ;     into $0258 (LINBUF+17)
81a4: ad 1f d0                  LDA CONSOL        ; Check if the
81a7: c9 05                     CMP #$05          ;   SELECT button is pressed
81a9: f0 76                     BEQ loc_8221      ; If yes, skip the rest and return to caller
81ab: a9 fe                     LDA #$fe          ; Set PORTB
81ad: 8d 01 d3                  STA PORTB         ;     to $FE - ??

; The following doesn't seem to make much sense... unless AFP may or may not be updatable or changes whenever its read?
81b0: ad 00 d8                  LDA AFP           ; Set A to low byte of ASCII 2 Floating Point Conversion vector addr?
81b3: aa                        TAX               ; Store value in X
81b4: e8                        INX               ; Increment and
81b5: 8e 00 d8                  STX AFP           ;     put the modified value back
81b8: ec 00 d8                  CPX AFP           ; Check if the two are the same
81bb: d0 5f                     BNE loc_821c      ; And if not, ...
81bd: ca                        DEX               ; Subtract one from X
81be: cd 00 d8                  CMP AFP           ;     and compare again
81c1: f0 59                     BEQ loc_821c      ; If equal, ...

81c3: a9 23                     LDA #$23          ; Set the
81c5: 85 07                     STA SRC_ADDR      ;     source
81c7: a9 82                     LDA #$82          ;     address
81c9: 85 08                     STA SRC_ADDR+1    ;     to $8223
81cb: a9 00                     LDA #$00          ; Set the
81cd: 85 09                     STA BOOT          ;     destination
81cf: a9 f9                     LDA #$f9          ;     address
81d1: 85 0a                     STA DOSVEC        ;     to $F900
81d3: a2 07                     LDX #$07          ; Set X = 7
81d5: a0 00                     LDY #$00          ; Set Y = 0
81d7: 20 0d 2e                  JSR $2e0d         ;           ?? Params in $07,$08,$09,$0A,X=7,Y=0 ??

        ; Params in X, Y
        ; $07 = MSB of
        ,$08 may be copied/repeated up through the following 254 bytes (if X != 0)
        2e0d: 84 0b     sub_2e0d        STY DOSVEC+1      ; Store Y (00) into DOSVEC+1 -- temp storage?
        2e0f: a0 00                     LDY #$00          ; Set Y = 0
        2e11: e0 00                     CPX #$00          ; If X = 0
        2e13: f0 0e                     BEQ sub_2e23      ;   then continue at $2e23

        ; This loop will copy 256 bytes from ($7 [$23],$8 [$82]) = $8223 to ($9 [$00], $A [$f9]) = $F900...
        2e15: b1 07     loc_2e15        LDA (TSTDAT),Y    ;
        2e17: 91 09                     STA (BOOT),Y      ;
        2e19: c8                        INY               ; Y = Y + 1
        2e1a: d0 f9                     BNE loc_2e15      ; Loop if no overflow

        2e1c: e6 0a                     INC DOSVEC        ; Add one to $10 ($f9 -> $fA)
        2e1e: e6 08     loc_2e1e        INC WARMST        ; ..
        2e20: ca                        DEX               ; .
        2e21: d0 f2                     BNE loc_2e15      ; ..
        2e23: a5 0b     sub_2e23        LDA DOSVEC+1      ; Set A <- DOSVEC + 1. This is the value from Y on sub entry @ sub_2e0d
        2e25: f0 09                     BEQ loc_2e30      ; If A = 0, exit sub & return to caller
        2e27: b1 07     loc_2e27        LDA (TSTDAT),Y    ; ..
        2e29: 91 09                     STA (BOOT),Y      ; ..
        2e2b: c8                        INY               ; .
        2e2c: c4 0b                     CPY DOSVEC+1      ; ..
        2e2e: d0 f7     loc_2e2e        BNE loc_2e27      ; ..
        2e30: 60        loc_2e30        RTS               ; `

81da: a9 80                     LDA #$80          ;
81dc: 8d 58 02                  STA LINBUF+17     ;
81df: ad 1f d0                  LDA CONSOL        ;
81e2: c9 03                     CMP #$03          ;
81e4: f0 36                     BEQ loc_821c      ;
81e6: ae 00 40                  LDX $4000         ;
81e9: 86 04                     STX RAMLO         ;
81eb: a9 e2                     LDA #$e2          ;
81ed: 8d 01 d3                  STA PORTB         ;
81f0: e8                        INX               ;
81f1: 8e 00 40                  STX $4000         ;
81f4: a9 fe                     LDA #$fe          ;
81f6: 8d 01 d3                  STA PORTB         ;
81f9: ec 00 40                  CPX $4000         ;
81fc: d0 07                     BNE loc_8205      ;
81fe: ca                        DEX               ;
81ff: 8e 00 40                  STX $4000         ;
8202: 4c 1c 82                  JMP loc_821c      ;
8205: a9 e2     loc_8205        LDA #$e2          ;
8207: 8d 01 d3                  STA PORTB         ;
820a: ce 00 40                  DEC $4000         ;
820d: ae 00 40                  LDX $4000         ;
8210: e4 04                     CPX RAMLO         ;
8212: d0 08                     BNE loc_821c      ;
8214: a9 c0                     LDA #$c0          ;
8216: 8d 58 02                  STA LINBUF+17     ;
8219: 20 cf f9                  JSR $f9cf         ; ?? This appears to call into an OS sub ??
821c: a9 fe     loc_821c        LDA #$fe          ;
821e: 8d 01 d3                  STA PORTB         ;
8221: 58        loc_8221        CLI               ; Clear the interrupt disable status
8222: 60                        RTS               ; Return to caller

8223: ad 09 19                  LDA UNK_BYTE_1909  ; ...
8226: c9 08                     CMP #$08          ; ..
8228: b0 30                     BCS loc_825a      ; .0
822a: 8d ce f9                  STA $f9ce         ; ...
822d: a9 00                     LDA #$00          ; ..
822f: 85 07                     STA TSTDAT        ; ..
8231: a9 ac                     LDA #$ac          ; ..
8233: 85 08                     STA WARMST        ; ..
8235: a9 00                     LDA #$00          ; ..
8237: 85 09                     STA BOOT          ; ..
8239: a9 c0                     LDA #$c0          ; ..
823b: 85 0a                     STA DOSVEC        ; ..
823d: a2 10                     LDX #$10          ; ..
823f: a0 00                     LDY #$00          ; ..
8241: 20 0d 2e                  JSR $2e0d         ;  ..
8244: a9 00                     LDA #$00          ; ..
8246: 85 07                     STA TSTDAT        ; ..
8248: a9 bc                     LDA #$bc          ; ..
824a: 85 08                     STA WARMST        ; ..
824c: a9 00                     LDA #$00          ; ..
824e: 85 09                     STA BOOT          ; ..
8250: a9 d8                     LDA #$d8          ; ..
8252: 85 0a                     STA DOSVEC        ; ..
8254: a2 04                     LDX #$04          ; ..
8256: a0 00                     LDY #$00          ; ..
8258: f0 17                     BEQ loc_8271      ; ..
825a: 8d cd f9  loc_825a        STA $f9cd         ; ...
825d: a9 f0                     LDA #$f0          ; ..
825f: 85 07                     STA TSTDAT        ; ..
8261: a9 96                     LDA #$96          ; ..
8263: 85 08                     STA WARMST        ; ..
8265: a9 00                     LDA #$00          ; ..
8267: 85 09                     STA BOOT          ; ..
8269: a9 dc                     LDA #$dc          ; ..
826b: 85 0a                     STA DOSVEC        ; ..
826d: a2 15                     LDX #$15          ; ..
826f: a0 10                     LDY #$10          ; ..
8271: 20 0d 2e  loc_8271        JSR $2e0d         ;  ..
8274: 18                        CLC               ; .
8275: 60                        RTS               ; `

8276: ad 09 19                  LDA UNK_BYTE_1909  ; ...
8279: c9 08                     CMP #$08          ; ..
827b: b0 32                     BCS loc_82af      ; .2
827d: cd ce f9                  CMP $f9ce         ; ...
8280: d0 4b                     BNE loc_82cd      ; .K
8282: a9 00                     LDA #$00          ; ..
8284: 85 07                     STA TSTDAT        ; ..
8286: a9 c0                     LDA #$c0          ; ..
8288: 85 08                     STA WARMST        ; ..
828a: a9 00                     LDA #$00          ; ..
828c: 85 09                     STA BOOT          ; ..
828e: a9 ac                     LDA #$ac          ; ..
8290: 85 0a                     STA DOSVEC        ; ..
8292: a2 10                     LDX #$10          ; ..
8294: a0 00                     LDY #$00          ; ..
8296: 20 0d 2e                  JSR $2e0d         ;  ..
8299: a9 00                     LDA #$00          ; ..
829b: 85 07                     STA TSTDAT        ; ..
829d: a9 d8                     LDA #$d8          ; ..
829f: 85 08                     STA WARMST        ; ..
82a1: a9 00                     LDA #$00          ; ..
82a3: 85 09                     STA BOOT          ; ..
82a5: a9 bc                     LDA #$bc          ; ..
82a7: 85 0a                     STA DOSVEC        ; ..
82a9: a2 04                     LDX #$04          ; ..
82ab: a0 00                     LDY #$00          ; ..
82ad: f0 19                     BEQ loc_82c8      ; ..
82af: cd cd f9  loc_82af        CMP $f9cd         ; ...
82b2: d0 19                     BNE loc_82cd      ; ..
82b4: a9 00                     LDA #$00          ; ..
82b6: 85 07                     STA TSTDAT        ; ..
82b8: a9 dc                     LDA #$dc          ; ..
82ba: 85 08                     STA WARMST        ; ..
82bc: a9 f0                     LDA #$f0          ; ..
82be: 85 09                     STA BOOT          ; ..
82c0: a9 96                     LDA #$96          ; ..
82c2: 85 0a                     STA DOSVEC        ; ..
82c4: a2 15                     LDX #$15          ; ..
82c6: a0 10                     LDY #$10          ; ..
82c8: 20 0d 2e  loc_82c8        JSR $2e0d         ;  ..
82cb: 18                        CLC               ; .
82cc: 60                        RTS               ; `

82cd: 38        loc_82cd        SEC               ; 8
82ce: 60                        RTS               ; `

82cf: 2c 0f d4                  BIT NMIST         ; ,..
82d2: 10 03                     BPL loc_82d7      ; ..
82d4: 6c 00 02                  JMP (VDSLST)      ; l..
82d7: 48        loc_82d7        PHA               ; H
82d8: ad 0f d4                  LDA NMIST         ; ...
82db: 29 20                     AND #$20          ; )
82dd: f0 03                     BEQ loc_82e2      ; ..
82df: 4c 00 d8                  JMP AFP           ; L..
82e2: 8a        loc_82e2        TXA               ; .
82e3: 48                        PHA               ; H
82e4: 98                        TYA               ; .
82e5: 48                        PHA               ; H
82e6: 8d 0f d4                  STA NMIRES        ; ...
82e9: 6c 22 02                  JMP (VVBLKI)      ; l".
82ec: d8                        CLD               ; .
82ed: 6c 16 02                  JMP (VIMIRQ)      ; l..
82f0: ff ff                     .BYTE $ff,$ff     ; ..
82f2: a2 ff                     LDX #$ff          ; ..
82f4: 8a        loc_82f4        TXA               ; .
82f5: ca                        DEX               ; .
82f6: 9d a5 fb                  STA $fba5,X       ; ...
82f9: d0 f9                     BNE loc_82f4      ; ..
82fb: 8e a4 fc                  STX $fca4         ; ...
82fe: a2 00                     LDX #$00          ; ..
8300: 8a        loc_8300        TXA               ; .
8301: e8                        INX               ; .
8302: 9d a5 fc                  STA $fca5,X       ; ...
8305: e0 ff                     CPX #$ff          ; ..
8307: d0 f7                     BNE loc_8300      ; ..
8309: a9 ff                     LDA #$ff          ; ..
830b: a2 fe                     LDX #$fe          ; ..
830d: 9d a5 fd  loc_830d        STA $fda5,X       ; ...
8310: 9d a5 fe                  STA $fea5,X       ; ...
8313: ca                        DEX               ; .
8314: d0 f7                     BNE loc_830d      ; ..
8316: 60                        RTS               ; `

8317: a9 80                     LDA #$80          ; ..
8319: 8d 5d 02                  STA LINBUF+22     ; .].
831c: ac 33 02                  LDY $0233         ; .3.
831f: 8c 63 02                  STY LINBUF+28     ; .c.
8322: ad 32 02                  LDA SSKCTL        ; .2.
8325: 8d 62 02                  STA LINBUF+27     ; .b.
8328: 4a                        LSR               ; J
8329: b0 16                     BCS loc_8341      ; ..
832b: 2a                        ROL               ; *
832c: 38                        SEC               ; 8
832d: e9 01                     SBC #$01          ; ..
832f: 8d 60 02                  STA LINBUF+25     ; .`.
8332: 8d 5e 02                  STA LINBUF+23     ; .^.
8335: 98                        TYA               ; .
8336: e9 00                     SBC #$00          ; ..
8338: 8d 61 02                  STA LINBUF+26     ; .a.
833b: 8d 5f 02                  STA LINBUF+24     ; ._.
833e: 4c 33 fa                  JMP $fa33         ; L3.
8341: 2a        loc_8341        ROL               ; *
8342: 8d 5e 02                  STA LINBUF+23     ; .^.
8345: 8c 5f 02                  STY LINBUF+24     ; ._.
8348: 69 01                     ADC #$01          ; i.
834a: 8d 60 02                  STA LINBUF+25     ; .`.
834d: 90 01                     BCC loc_8350      ; ..
834f: c8                        INY               ; .
8350: 8c 61 02  loc_8350        STY LINBUF+26     ; .a.
8353: 0e 5d 02                  ASL LINBUF+22     ; .].
8356: a2 00                     LDX #$00          ; ..
8358: bd a5 fb  loc_8358        LDA $fba5,X       ; ...
835b: f0 3e                     BEQ loc_839b      ; .>
835d: aa                        TAX               ; .
835e: bd a5 fd                  LDA $fda5,X       ; ...
8361: cd 5e 02                  CMP LINBUF+23     ; .^.
8364: d0 f2                     BNE loc_8358      ; ..
8366: ad 5f 02                  LDA LINBUF+24     ; ._.
8369: 0d 5c 02                  ORA LINBUF+21     ; .\.
836c: dd a5 fe                  CMP $fea5,X       ; ...
836f: d0 e7                     BNE loc_8358      ; ..
8371: 2c 64 02                  BIT LINBUF+29     ; ,d.
8374: 10 08                     BPL loc_837e      ; ..
8376: a9 ff                     LDA #$ff          ; ..
8378: 9d a5 fe                  STA $fea5,X       ; ...
837b: 4c 78 fa                  JMP $fa78         ; Lx.
837e: 20 62 fb  loc_837e        JSR $fb62         ;  b.
8381: 20 73 fb                  JSR $fb73         ;  s.
8384: 20 88 fb                  JSR $fb88         ;  ..
8387: 8d 6d fa                  STA $fa6d         ; .m.
838a: 8c 6e fa                  STY $fa6e         ; .n.
838d: a0 00                     LDY #$00          ; ..
838f: b9 ff ff  loc_838f        LDA $ffff,Y       ; ...
8392: 99 00 01                  STA $0100,Y       ; ...
8395: c8                        INY               ; .
8396: 10 f7                     BPL loc_838f      ; ..
8398: 4c 4c fb                  JMP $fb4c         ; LL.
839b: 2c 5b 02  loc_839b        BIT LINBUF+20     ; ,[.
839e: 30 2c                     BMI loc_83cc      ; 0,
83a0: ad 03 19                  LDA $1903         ; ...
83a3: 8d 32 02                  STA SSKCTL        ; .2.
83a6: ad 04 19                  LDA $1904         ; ...
83a9: 8d 33 02                  STA $0233         ; .3.
83ac: a9 02                     LDA #$02          ; ..
83ae: 85 06                     STA TRAMSZ        ; ..
83b0: 20 8e 24  loc_83b0        JSR $248e         ;  .$
83b3: 10 07                     BPL loc_83bc      ; ..
83b5: c6 06                     DEC TRAMSZ        ; ..
83b7: d0 f7                     BNE loc_83b0      ; ..
83b9: 4c 0c fb  loc_83b9        JMP $fb0c         ; L..
83bc: a2 03     loc_83bc        LDX #$03          ; ..
83be: bd 00 01  loc_83be        LDA $0100,X       ; ...
83c1: dd 05 19                  CMP $1905,X       ; ...
83c4: d0 f3                     BNE loc_83b9      ; ..
83c6: ca                        DEX               ; .
83c7: 10 f5                     BPL loc_83be      ; ..
83c9: ce 5b 02                  DEC LINBUF+20     ; .[.
83cc: ad 60 02  loc_83cc        LDA LINBUF+25     ; .`.
83cf: 8d 32 02                  STA SSKCTL        ; .2.
83d2: ad 61 02                  LDA LINBUF+26     ; .a.
83d5: 8d 33 02                  STA $0233         ; .3.
83d8: a9 02                     LDA #$02          ; ..
83da: 85 06                     STA TRAMSZ        ; ..
83dc: 20 8e 24  loc_83dc        JSR $248e         ;  .$
83df: 10 06                     BPL loc_83e7      ; ..
83e1: c6 06                     DEC TRAMSZ        ; ..
83e3: d0 f7                     BNE loc_83dc      ; ..
83e5: f0 48                     BEQ loc_842f      ; .H
83e7: ae a4 fd  loc_83e7        LDX $fda4         ; ...
83ea: 20 88 fb                  JSR $fb88         ;  ..
83ed: 8c d9 fa                  STY $fad9         ; ...
83f0: 49 80                     EOR #$80          ; I.
83f2: 8d d8 fa                  STA $fad8         ; ...
83f5: a0 00                     LDY #$00          ; ..
83f7: b9 00 01  loc_83f7        LDA $0100,Y       ; ...
83fa: 99 ff ff                  STA $ffff,Y       ; ...
83fd: c8                        INY               ; .
83fe: 10 f7                     BPL loc_83f7      ; ..
8400: a9 fe                     LDA #$fe          ; ..
8402: 8d 01 d3                  STA PORTB         ; ...
8405: a9 40                     LDA #$40          ; .@
8407: 8d 0e d4                  STA NMIEN         ; ...
840a: 58                        CLI               ; X
840b: ae a4 fd                  LDX $fda4         ; ...
840e: a9 ff                     LDA #$ff          ; ..
8410: 9d a5 fe                  STA $fea5,X       ; ...
8413: 9d a5 fd                  STA $fda5,X       ; ...
8416: ad 62 02                  LDA LINBUF+27     ; .b.
8419: 8d 32 02                  STA SSKCTL        ; .2.
841c: ad 63 02                  LDA LINBUF+28     ; .c.
841f: 8d 33 02                  STA $0233         ; .3.
8422: a9 02                     LDA #$02          ; ..
8424: 85 06                     STA TRAMSZ        ; ..
8426: 20 8e 24  loc_8426        JSR $248e         ;  .$
8429: 10 18                     BPL loc_8443      ; ..
842b: c6 06                     DEC TRAMSZ        ; ..
842d: d0 f7                     BNE loc_8426      ; ..
842f: ad 62 02  loc_842f        LDA LINBUF+27     ; .b.
8432: 8d 32 02                  STA SSKCTL        ; .2.
8435: ad 63 02                  LDA LINBUF+28     ; .c.
8438: 8d 33 02                  STA $0233         ; .3.
843b: a9 00                     LDA #$00          ; ..
843d: 8d 5b 02                  STA LINBUF+20     ; .[.
8440: a0 ff                     LDY #$ff          ; ..
8442: 60                        RTS               ; `

8443: ae a4 fd  loc_8443        LDX $fda4         ; ...
8446: ad 5f 02                  LDA LINBUF+24     ; ._.
8449: 0d 5c 02                  ORA LINBUF+21     ; .\.
844c: 9d a5 fe                  STA $fea5,X       ; ...
844f: ad 5e 02                  LDA LINBUF+23     ; .^.
8452: 9d a5 fd                  STA $fda5,X       ; ...
8455: 20 62 fb                  JSR $fb62         ;  b.
8458: 20 73 fb                  JSR $fb73         ;  s.
845b: 20 88 fb                  JSR $fb88         ;  ..
845e: 8d 47 fb                  STA $fb47         ; .G.
8461: 8c 48 fb                  STY $fb48         ; .H.
8464: a0 00                     LDY #$00          ; ..
8466: b9 00 01  loc_8466        LDA $0100,Y       ; ...
8469: 99 ff ff                  STA $ffff,Y       ; ...
846c: c8                        INY               ; .
846d: 10 f7                     BPL loc_8466      ; ..
846f: ee 32 02                  INC SSKCTL        ; .2.
8472: d0 03                     BNE loc_8477      ; ..
8474: ee 33 02                  INC $0233         ; .3.
8477: a9 fe     loc_8477        LDA #$fe          ; ..
8479: 8d 01 d3                  STA PORTB         ; ...
847c: a9 40                     LDA #$40          ; .@
847e: 8d 0e d4                  STA NMIEN         ; ...
8481: 58                        CLI               ; X
8482: a0 01                     LDY #$01          ; ..
8484: 60                        RTS               ; `

8485: bc a5 fc                  LDY $fca5,X       ; ...
8488: bd a5 fb                  LDA $fba5,X       ; ...
848b: 99 a5 fb                  STA $fba5,Y       ; ...
848e: a8                        TAY               ; .
848f: bd a5 fc                  LDA $fca5,X       ; ...
8492: 99 a5 fc                  STA $fca5,Y       ; ...
8495: 60                        RTS               ; `

8496: ad a5 fb                  LDA $fba5         ; ...
8499: 9d a5 fb                  STA $fba5,X       ; ...
849c: 8e a5 fb                  STX $fba5         ; ...
849f: a8                        TAY               ; .
84a0: b9 a5 fc                  LDA $fca5,Y       ; ...
84a3: 9d a5 fc                  STA $fca5,X       ; ...
84a6: 8a                        TXA               ; .
84a7: 99 a5 fc                  STA $fca5,Y       ; ...
84aa: 60                        RTS               ; `

84ab: 78                        SEI               ; x
84ac: a0 00                     LDY #$00          ; ..
84ae: 8c 0e d4                  STY NMIEN         ; ...
84b1: 8a                        TXA               ; .
84b2: 0a                        ASL               ; .
84b3: 2a                        ROL               ; *
84b4: 2a                        ROL               ; *
84b5: 0a                        ASL               ; .
84b6: 0a                        ASL               ; .
84b7: 29 0c                     AND #$0c          ; ).
84b9: 09 e2                     ORA #$e2          ; ..
84bb: 8d 01 d3                  STA PORTB         ; ...
84be: 8a                        TXA               ; .
84bf: 29 3f                     AND #$3f          ; )?
84c1: 09 40                     ORA #$40          ; .@
84c3: a8                        TAY               ; .
84c4: ad 5d 02                  LDA LINBUF+22     ; .].
84c7: 60                        RTS               ; `

84c8: 02                        .BYTE $02         ; .
84c9: 8d 83 62                  STA $6283         ; ..b
84cc: 20 35 58                  JSR $5835         ;  5X
84cf: b0 03                     BCS loc_84d4      ; ..
84d1: 4c 09 52                  JMP $5209         ; L.R
84d4: 4c 25 52  loc_84d4        JMP $5225         ; L%R
84d7: a2 00                     LDX #$00          ; ..
84d9: bd a2 63  loc_84d9        LDA $63a2,X       ; ..c
84dc: c9 ff                     CMP #$ff          ; ..
84de: f0 07                     BEQ loc_84e7      ; ..
84e0: e8                        INX               ; .
84e1: e0 04                     CPX #$04          ; ..
84e3: 90 f4                     BCC loc_84d9      ; ..
84e5: b0 04                     BCS loc_84eb      ; ..
84e7: 8a        loc_84e7        TXA               ; .
84e8: 4c 5a 55                  JMP $555a         ; LZU
84eb: a2 31     loc_84eb        LDX #$31          ; .1
84ed: 8e 51 5d                  STX $5d51         ; .Q]
84f0: e8                        INX               ; .
84f1: 8e 67 5d                  STX $5d67         ; .g]
84f4: e8                        INX               ; .
84f5: 8e 7d 5d                  STX $5d7d         ; .}]
84f8: e8                        INX               ; .
84f9: 8e 93 5d                  STX $5d93         ; ..]
84fc: 20 2e 50                  JSR $502e         ;  .P
84ff: a9 85                     LDA #$85          ; ..
8501: 8d 3a 19                  STA $193a         ; .:.
8504: a9 5f                     LDA #$5f          ; ._
8506: 8d 3b 19                  STA $193b         ; .;.
8509: a9 3d                     LDA #$3d          ; .=
850b: 8d 44 19                  STA $1944         ; .D.
850e: a9 5f                     LDA #$5f          ; ._
8510: 8d 45 19                  STA $1945         ; .E.
8513: a2 03                     LDX #$03          ; ..
8515: bd a2 63  loc_8515        LDA $63a2,X       ; ..c
8518: 9d 46 19                  STA $1946,X       ; .F.
851b: ca                        DEX               ; .
851c: 10 f7                     BPL loc_8515      ; ..
851e: 20 8c 50                  JSR $508c         ;  .P
8521: 20 49 50  loc_8521        JSR $5049         ;  IP
8524: 90 06                     BCC loc_852c      ; ..
8526: c9 1b                     CMP #$1b          ; ..
8528: f0 10                     BEQ loc_853a      ; ..
852a: d0 f5                     BNE loc_8521      ; ..
852c: 18        loc_852c        CLC               ; .
852d: 69 06                     ADC #$06          ; i.
852f: 8d 83 62                  STA $6283         ; ..b
8532: 20 35 58                  JSR $5835         ;  5X
8535: b0 03                     BCS loc_853a      ; ..
8537: 4c 09 52                  JMP $5209         ; L.R
853a: 4c 25 52  loc_853a        JMP $5225         ; L%R
853d: ce 7f 62                  DEC $627f         ; .b
8540: ad 98 63                  LDA CHR_STOMACH   ; ..c
8543: 10 03                     BPL loc_8548      ; ..
8545: 4c c1 56                  JMP $56c1         ; L.V
8548: a9 04     loc_8548        LDA #$04          ; ..
854a: a0 02                     LDY #$02          ; ..
854c: 20 d7 56                  JSR $56d7         ;  .V
854f: a0 00                     LDY #$00          ; ..
8551: b1 41                     LDA (SOUNDR),Y    ; .A
8553: 29 78                     AND #$78          ; )x
8555: f0 0a                     BEQ loc_8561      ; ..
8557: a2 00                     LDX #$00          ; ..
8559: dd 9e 55  loc_8559        CMP $559e,X       ; ..U
855c: f0 09                     BEQ loc_8567      ; ..
855e: ca                        DEX               ; .
855f: 10 f8                     BPL loc_8559      ; ..
8561: 20 02 56  loc_8561        JSR $5602         ;  .V
8564: 4c 09 52                  JMP $5209         ; L.R
8567: bd 9f 55  loc_8567        LDA $559f,X       ; ..U
856a: 48                        PHA               ; H
856b: bd a0 55                  LDA $55a0,X       ; ..U
856e: 48                        PHA               ; H
856f: 60                        RTS               ; `

8570: 08                        PHP               ; .
8571: 55 a0                     EOR $a0,X         ; U.
8573: a0 00                     LDY #$00          ; ..
8575: b1 43                     LDA (ZBUFP),Y     ; .C
8577: aa                        TAX               ; .
8578: 09 80                     ORA #$80          ; ..
857a: 85 51                     STA HOLD1         ; .Q
857c: 98                        TYA               ; .
857d: 9d 90 63                  STA CHR_LIT_TORCH_FLAG,X  ; ..c
8580: 20 b7 55                  JSR $55b7         ;  .U
8583: 20 02 56                  JSR $5602         ;  .V
8586: 4c 09 52                  JMP $5209         ; L.R
8589: a9 00                     LDA #$00          ; ..
858b: 85 3d                     STA BPTR          ; .=
858d: a9 65                     LDA #$65          ; .e
858f: 85 3e                     STA FTYPE         ; .>
8591: a9 00                     LDA #$00          ; ..
8593: 85 49                     STA ERRNO         ; .I
8595: a0 00     loc_8595        LDY #$00          ; ..
8597: b1 3d                     LDA (BPTR),Y      ; .=
8599: 29 83                     AND #$83          ; ).
859b: c5 51                     CMP HOLD1         ; .Q
859d: d0 03                     BNE loc_85a2      ; ..
859f: 20 01 4a                  JSR $4a01         ;  .J
85a2: a5 3d     loc_85a2        LDA BPTR          ; .=
85a4: 18                        CLC               ; .
85a5: 69 10                     ADC #$10          ; i.
85a7: 85 3d                     STA BPTR          ; .=
85a9: 90 02                     BCC loc_85ad      ; ..
85ab: e6 3e                     INC FTYPE         ; .>
85ad: e6 49     loc_85ad        INC ERRNO         ; .I
85af: a5 49                     LDA ERRNO         ; .I
85b1: c9 40                     CMP #$40          ; .@
85b3: 90 e0                     BCC loc_8595      ; ..
85b5: a5 51                     LDA HOLD1         ; .Q
85b7: 29 03                     AND #$03          ; ).
85b9: c9 03                     CMP #$03          ; ..
85bb: d0 16                     BNE loc_85d3      ; ..
85bd: aa                        TAX               ; .
85be: a9 00                     LDA #$00          ; ..
85c0: 9d 90 63                  STA CHR_LIT_TORCH_FLAG,X  ; ..c
85c3: a2 00                     LDX #$00          ; ..
85c5: a9 00     loc_85c5        LDA #$00          ; ..
85c7: 9d 50 63                  STA CHR_STA_UNKNOWN,X  ; .Pc
85ca: 8a                        TXA               ; .
85cb: 18                        CLC               ; .
85cc: 69 08                     ADC #$08          ; i.
85ce: aa                        TAX               ; .
85cf: c9 38                     CMP #$38          ; .8
85d1: 90 f2                     BCC loc_85c5      ; ..
85d3: 60        loc_85d3        RTS               ; `

85d4: 18                        CLC               ; .
85d5: a9 06                     LDA #$06          ; ..
85d7: 65 41                     ADC SOUNDR        ; eA
85d9: 8d 3c 19                  STA $193c         ; .<.
85dc: 85 07                     STA TSTDAT        ; ..
85de: a9 00                     LDA #$00          ; ..
85e0: 65 42                     ADC CRITIC        ; eB
85e2: 8d 3d 19                  STA $193d         ; .=.
85e5: 85 08                     STA WARMST        ; ..
85e7: a0 06                     LDY #$06          ; ..
85e9: b1 07                     LDA (TSTDAT),Y    ; ..
85eb: d0 04                     BNE loc_85f1      ; ..
85ed: a9 20                     LDA #$20          ; .
85ef: 91 07                     STA (TSTDAT),Y    ; ..
85f1: a9 e8     loc_85f1        LDA #$e8          ; ..
85f3: 85 16                     STA BUFADR+1      ; ..
85f5: a9 60                     LDA #$60          ; .`
85f7: 85 17                     STA ICCOMT        ; ..
85f9: ae 4a 19                  LDX $194a         ; .J.
85fc: 20 5c 3c                  JSR $3c5c         ;  \<
85ff: a9 02                     LDA #$02          ; ..
8601: 4c fc 2b                  JMP $2bfc         ; L.+
8604: a0 00                     LDY #$00          ; ..
8606: b1 41                     LDA (SOUNDR),Y    ; .A
8608: 29 78                     AND #$78          ; )x
860a: f0 0a                     BEQ loc_8616      ; ..
860c: a2 00                     LDX #$00          ; ..
860e: dd 4f 56  loc_860e        CMP $564f,X       ; .OV
8611: f0 06                     BEQ loc_8619      ; ..
8613: ca                        DEX               ; .
8614: 10 f8                     BPL loc_860e      ; ..
8616: 4c 09 52  loc_8616        JMP $5209         ; L.R
8619: bd 51 56  loc_8619        LDA $5651,X       ; .QV
861c: 48                        PHA               ; H
861d: bd 50 56                  LDA $5650,X       ; .PV
8620: 48                        PHA               ; H
8621: ff                        .BYTE $ff         ; .
8622: 08                        PHP               ; .
8623: 52                        .BYTE $52         ; R
8624: 60                        RTS               ; `

8625: 29 03                     AND #$03          ; ).
8627: aa                        TAX               ; .
8628: bd 5f 56                  LDA $565f,X       ; ._V
862b: 48                        PHA               ; H
862c: bd 63 56                  LDA $5663,X       ; .cV
862f: 48                        PHA               ; H
8630: 60                        RTS               ; `

8631: 56 56                     LSR COLCRS+1,X    ; VV
8633: 56 57                     LSR DINDEX,X      ; VW
8635: 66 a6                     ROR $a6           ; f.
8637: e9 22                     SBC #$22          ; ."
8639: ad bb 63                  LDA INV_FOOD      ; ..c
863c: d0 03                     BNE loc_8641      ; ..
863e: 4c 74 57                  JMP $5774         ; LtW
8641: ce bb 63  loc_8641        DEC INV_FOOD      ; ..c
8644: ad 98 63                  LDA CHR_STOMACH   ; ..c
8647: 30 1a                     BMI loc_8663      ; 0.
8649: ad 99 63                  LDA CHR_HUNGER    ; ..c
864c: 4a                        LSR               ; J
864d: 4a                        LSR               ; J
864e: 4a                        LSR               ; J
864f: 4a                        LSR               ; J
8650: aa                        TAX               ; .
8651: bd 54 60                  LDA $6054,X       ; .T`
8654: a2 99                     LDX #$99          ; ..
8656: 20 43 2e                  JSR $2e43         ;  C.
8659: a9 1c                     LDA #$1c          ; ..
865b: a2 98                     LDX #$98          ; ..
865d: 20 43 2e                  JSR $2e43         ;  C.
8660: 4c 25 52                  JMP $5225         ; L%R
8663: a9 ef     loc_8663        LDA #$ef          ; ..
8665: 85 16                     STA BUFADR+1      ; ..
8667: a9 5f                     LDA #$5f          ; ._
8669: 85 17                     STA ICCOMT        ; ..
866b: ae 4a 19                  LDX $194a         ; .J.
866e: 20 5c 3c                  JSR $3c5c         ;  \<
8671: a9 10                     LDA #$10          ; ..
8673: 20 fc 2b                  JSR $2bfc         ;  .+
8676: 4c 25 52                  JMP $5225         ; L%R
8679: ad bc 63                  LDA INV_WATER     ; ..c
867c: d0 03                     BNE loc_8681      ; ..
867e: 4c 74 57                  JMP $5774         ; LtW
8681: ce bc 63  loc_8681        DEC INV_WATER     ; ..c
8684: ad 98 63                  LDA CHR_STOMACH   ; ..c
8687: 30 0a                     BMI loc_8693      ; 0.
8689: a9 10                     LDA #$10          ; ..
868b: a0 08                     LDY #$08          ; ..
868d: 20 d7 56                  JSR $56d7         ;  .V
8690: 4c 25 52                  JMP $5225         ; L%R
8693: a9 64     loc_8693        LDA #$64          ; .d
8695: 85 16                     STA BUFADR+1      ; ..
8697: a9 60                     LDA #$60          ; .`
8699: 85 17                     STA ICCOMT        ; ..
869b: ae 4a 19                  LDX $194a         ; .J.
869e: 20 5c 3c                  JSR $3c5c         ;  \<
86a1: a9 10                     LDA #$10          ; ..
86a3: 20 fc 2b                  JSR $2bfc         ;  .+
86a6: 4c 25 52                  JMP $5225         ; L%R
86a9: 48                        PHA               ; H
86aa: 98                        TYA               ; .
86ab: a2 98                     LDX #$98          ; ..
86ad: 20 43 2e                  JSR $2e43         ;  C.
86b0: 68                        PLA               ; h
86b1: a2 9a                     LDX #$9a          ; ..
86b3: 4c 43 2e                  JMP $2e43         ; LC.
86b6: 20 dc 57  loc_86b6        JSR $57dc         ;  .W
86b9: 4c 25 52                  JMP $5225         ; L%R
86bc: ad bd 63                  LDA INV_TORCHES   ; ..c
86bf: d0 06                     BNE loc_86c7      ; ..
86c1: 4c 74 57                  JMP $5774         ; LtW
86c4: 4c 25 52  loc_86c4        JMP $5225         ; L%R
86c7: 20 ab 57  loc_86c7        JSR $57ab         ;  .W
86ca: b0 f8                     BCS loc_86c4      ; ..
86cc: a2 61                     LDX #$61          ; .a
86ce: a0 29                     LDY #$29          ; .)
86d0: 20 4d 4b                  JSR $4b4d         ;  MK
86d3: 30 e1                     BMI loc_86b6      ; 0.
86d5: a9 88                     LDA #$88          ; ..
86d7: 20 b0 49                  JSR $49b0         ;  .I
86da: 30 da                     BMI loc_86b6      ; 0.
86dc: a0 02                     LDY #$02          ; ..
86de: b9 1a 61  loc_86de        LDA $611a,Y       ; ..a
86e1: 91 3d                     STA (BPTR),Y      ; .=
86e3: c8                        INY               ; .
86e4: c0 0f                     CPY #$0f          ; ..
86e6: d0 f6                     BNE loc_86de      ; ..
86e8: a5 4b                     LDA CASSBT        ; .K
86ea: 91 3d                     STA (BPTR),Y      ; .=
86ec: ce bd 63                  DEC INV_TORCHES   ; ..c
86ef: ee 90 63                  INC CHR_LIT_TORCH_FLAG  ; ..c
86f2: 4c af 54                  JMP $54af         ; L.T
86f5: ad c1 63                  LDA INV_TIMEPIECES  ; ..c
86f8: f0 4c                     BEQ loc_8746      ; .L
86fa: a9 61                     LDA #$61          ; .a
86fc: 85 16                     STA BUFADR+1      ; ..
86fe: a9 61                     LDA #$61          ; .a
8700: 85 17                     STA ICCOMT        ; ..
8702: 20 31 2e                  JSR $2e31         ;  1.
8705: a9 73                     LDA #$73          ; .s
8707: ae 09 63                  LDX TME_MINUTES   ; ..c
870a: e0 01                     CPX #$01          ; ..
870c: d0 02                     BNE loc_8710      ; ..
870e: a9 20                     LDA #$20          ; .
8710: 8d 76 61  loc_8710        STA $6176         ; .va
8713: a9 01                     LDA #$01          ; ..
8715: e0 0a                     CPX #$0a          ; ..
8717: 90 02                     BCC loc_871b      ; ..
8719: a9 02                     LDA #$02          ; ..
871b: 8d 6e 61  loc_871b        STA $616e         ; .na
871e: ad 0a 63                  LDA TME_HOURS     ; ..c
8721: a0 01                     LDY #$01          ; ..
8723: c9 0a                     CMP #$0a          ; ..
8725: 90 02                     BCC loc_8729      ; ..
8727: a0 02                     LDY #$02          ; ..
8729: 8c 86 61  loc_8729        STY $6186         ; ..a
872c: 0a                        ASL               ; .
872d: aa                        TAX               ; .
872e: bd 91 61                  LDA $6191,X       ; ..a
8731: 8d 87 61                  STA $6187         ; ..a
8734: bd 92 61                  LDA $6192,X       ; ..a
8737: 8d 88 61                  STA $6188         ; ..a
873a: ae 4a 19  loc_873a        LDX $194a         ; .J.
873d: 20 5c 3c                  JSR $3c5c         ;  \<
8740: 20 fa 2b                  JSR $2bfa         ;  .+
8743: 4c 25 52                  JMP $5225         ; L%R
8746: a9 4d     loc_8746        LDA #$4d          ; .M
8748: 85 16                     STA BUFADR+1      ; ..
874a: a9 61                     LDA #$61          ; .a
874c: 85 17                     STA ICCOMT        ; ..
874e: d0 ea                     BNE loc_873a      ; ..
8750: a9 00                     LDA #$00          ; ..
8752: 8d 76 62                  STA $6276         ; .vb
8755: a9 d0                     LDA #$d0          ; ..
8757: 8d b0 51                  STA $51b0         ; ..Q
875a: a9 2e                     LDA #$2e          ; ..
875c: 8d 3a 19                  STA $193a         ; .:.
875f: a9 5f                     LDA #$5f          ; ._
8761: 8d 3b 19                  STA $193b         ; .;.
8764: 4c d8 51                  JMP $51d8         ; L.Q
8767: c9 80                     CMP #$80          ; ..
8769: b0 11                     BCS loc_877c      ; ..
876b: a8                        TAY               ; .
876c: b9 4b 64                  LDA INV_ARR_END,Y  ; .Kd
876f: 85 0a                     STA DOSVEC        ; ..
8771: b9 0b 64                  LDA INV_ARR_START,Y  ; ..d
8774: 85 09                     STA BOOT          ; ..
8776: a0 02                     LDY #$02          ; ..
8778: a9 08                     LDA #$08          ; ..
877a: 91 09                     STA (BOOT),Y      ; ..
877c: 60        loc_877c        RTS               ; `

877d: a9 96     loc_877d        LDA #$96          ; ..
877f: 85 16                     STA BUFADR+1      ; ..
8781: a9 5f                     LDA #$5f          ; ._
8783: 85 17                     STA ICCOMT        ; ..
8785: ae 4a 19                  LDX $194a         ; .J.
8788: 20 5c 3c                  JSR $3c5c         ;  \<
878b: a9 c6     loc_878b        LDA #$c6          ; ..
878d: 8d 77 19                  STA UNK_MEMREF_LO_1977  ; .w.
8790: a9 57                     LDA #$57          ; .W
8792: 8d 78 19                  STA UNK_MEMREF_HI_1978  ; .x.
8795: 4c f3 2f                  JMP $2ff3         ; L./
8798: a5 31                     LDA CHKSUM        ; .1
879a: 30 ef                     BMI loc_878b      ; 0.
879c: c9 1b                     CMP #$1b          ; ..
879e: f0 0d                     BEQ loc_87ad      ; ..
87a0: 38                        SEC               ; 8
87a1: e9 31                     SBC #$31          ; .1
87a3: 90 d8                     BCC loc_877d      ; ..
87a5: c9 02                     CMP #$02          ; ..
87a7: b0 d4                     BCS loc_877d      ; ..
87a9: 8d 83 62                  STA $6283         ; ..b
87ac: 18                        CLC               ; .
87ad: 60        loc_87ad        RTS               ; `

87ae: a9 c1                     LDA #$c1          ; ..
87b0: 85 16                     STA BUFADR+1      ; ..
87b2: a9 61                     LDA #$61          ; .a
87b4: 85 17                     STA ICCOMT        ; ..
87b6: ae 4a 19                  LDX $194a         ; .J.
87b9: 20 5c 3c                  JSR $3c5c         ;  \<
87bc: 4c fa 2b                  JMP $2bfa         ; L.+
87bf: ae 15 63                  LDX CHR_LOC_MAP   ; ..c
87c2: ad 13 63                  LDA CHR_LOC_X     ; ..c
87c5: 18                        CLC               ; .
87c6: 7d 8b 62                  ADC $628b,X       ; }.b
87c9: 8d 89 62                  STA $6289         ; ..b
87cc: 38                        SEC               ; 8
87cd: bd 92 62                  LDA $6292,X       ; ..b
87d0: ed 14 63                  SBC CHR_LOC_Y     ; ..c
87d3: 8d 8a 62                  STA $628a         ; ..b
87d6: 10 05                     BPL loc_87dd      ; ..
87d8: a9 ff                     LDA #$ff          ; ..
87da: 8d 89 62                  STA $6289         ; ..b
87dd: a9 99     loc_87dd        LDA #$99          ; ..
87df: 85 16                     STA BUFADR+1      ; ..
87e1: a9 62                     LDA #$62          ; .b
87e3: 85 17                     STA ICCOMT        ; ..
87e5: ae 4a 19                  LDX $194a         ; .J.
87e8: ce fe 18                  DEC $18fe         ; ...
87eb: 20 5c 3c                  JSR $3c5c         ;  \<
87ee: a9 00                     LDA #$00          ; ..
87f0: 8d fe 18                  STA $18fe         ; ...
87f3: 20 b0 2b                  JSR $2bb0         ;  .+
87f6: a9 07                     LDA #$07          ; ..
87f8: 85 16                     STA BUFADR+1      ; ..
87fa: a9 20                     LDA #$20          ; .
87fc: 85 17                     STA ICCOMT        ; ..
87fe: ae 4a 19                  LDX $194a         ; .J.
8801: 20 5c 3c                  JSR $3c5c         ;  \<
8804: 4c 09 52                  JMP $5209         ; L.R
8807: ae 83 62                  LDX $6283         ; ..b
880a: bd 9c 63                  LDA $639c,X       ; ..c
880d: 30 07                     BMI loc_8816      ; 0.
880f: c5 4b                     CMP CASSBT        ; .K
8811: f0 03                     BEQ loc_8816      ; ..
8813: 20 95 57                  JSR $5795         ;  .W
8816: a5 4b     loc_8816        LDA CASSBT        ; .K
8818: 20 b4 4e                  JSR $4eb4         ;  .N
881b: 08                        PHP               ; .
881c: 20 a2 4e                  JSR $4ea2         ;  .N
881f: a5 4b                     LDA CASSBT        ; .K
8821: ae 83 62                  LDX $6283         ; ..b
8824: 9d 9c 63                  STA $639c,X       ; ..c
8827: 28                        PLP               ; (
8828: 60                        RTS               ; `

8829: a2 00                     LDX #$00          ; ..
882b: 8e 7b 19                  STX $197b         ; .{.
882e: ca                        DEX               ; .
882f: 8e c1 58                  STX $58c1         ; ..X
8832: a9 0f                     LDA #$0f          ; ..
8834: 8d 84 62                  STA $6284         ; ..b
8837: ae 84 62  loc_8837        LDX $6284         ; ..b
883a: bd 94 64                  LDA $6494,X       ; ..d
883d: c9 02                     CMP #$02          ; ..
883f: d0 36                     BNE loc_8877      ; .6
8841: bd c4 64                  LDA $64c4,X       ; ..d
8844: cd 15 63                  CMP CHR_LOC_MAP   ; ..c
8847: d0 2e                     BNE loc_8877      ; ..
8849: bd a4 64                  LDA $64a4,X       ; ..d
884c: cd 13 63                  CMP CHR_LOC_X     ; ..c
884f: d0 26                     BNE loc_8877      ; .&
8851: bd b4 64                  LDA $64b4,X       ; ..d
8854: cd 14 63                  CMP CHR_LOC_Y     ; ..c
8857: d0 1e                     BNE loc_8877      ; ..
8859: 24 4b                     BIT CASSBT        ; $K
885b: 10 0a                     BPL loc_8867      ; ..
885d: a9 53                     LDA #$53          ; .S
885f: 8d c1 59                  STA $59c1         ; ..Y
8862: a9 5e                     LDA #$5e          ; .^
8864: 8d c2 59                  STA $59c2         ; ..Y
8867: ae 84 62  loc_8867        LDX $6284         ; ..b
886a: bd d4 64                  LDA $64d4,X       ; ..d
886d: 85 4b                     STA CASSBT        ; .K
886f: 8d c1 58                  STA $58c1         ; ..X
8872: 20 c2 58                  JSR $58c2         ;  .X
8875: b0 1b                     BCS loc_8892      ; ..
8877: ce 84 62  loc_8877        DEC $6284         ; ..b
887a: 10 bb                     BPL loc_8837      ; ..
887c: ad c1 58                  LDA $58c1         ; ..X
887f: 10 11                     BPL loc_8892      ; ..
8881: a9 ee                     LDA #$ee          ; ..
8883: 85 16                     STA BUFADR+1      ; ..
8885: a9 59                     LDA #$59          ; .Y
8887: 85 17                     STA ICCOMT        ; ..
8889: ae 4a 19                  LDX $194a         ; .J.
888c: 20 5c 3c                  JSR $3c5c         ;  \<
888f: 20 b0 2b                  JSR $2bb0         ;  .+
8892: 60        loc_8892        RTS               ; `

8893: 00                        BRK               ; .
8894: a5 4b                     LDA CASSBT        ; .K
8896: 20 74 4b                  JSR $4b74         ;  tK
8899: a9 06                     LDA #$06          ; ..
889b: 18                        CLC               ; .
889c: 65 41                     ADC SOUNDR        ; eA
889e: 8d c1 59                  STA $59c1         ; ..Y
88a1: a5 42                     LDA CRITIC        ; .B
88a3: 69 00                     ADC #$00          ; i.
88a5: 8d c2 59                  STA $59c2         ; ..Y
88a8: a9 9b                     LDA #$9b          ; ..
88aa: 8d 55 59                  STA $5955         ; .UY
88ad: a9 59                     LDA #$59          ; .Y
88af: 8d 56 59                  STA $5956         ; .VY
88b2: a0 00                     LDY #$00          ; ..
88b4: b1 41                     LDA (SOUNDR),Y    ; .A
88b6: 29 7f                     AND #$7f          ; )
88b8: d0 1c                     BNE loc_88d6      ; ..
88ba: a5 4b                     LDA CASSBT        ; .K
88bc: 20 c4 4e                  JSR $4ec4         ;  .N
88bf: a0 01                     LDY #$01          ; ..
88c1: b1 43                     LDA (ZBUFP),Y     ; .C
88c3: 8d e3 59                  STA $59e3         ; ..Y
88c6: c8                        INY               ; .
88c7: b1 00                     LDA (LINZBS),Y    ; ..
88c9: 8d e4 59                  STA $59e4         ; ..Y
88cc: a9 ab                     LDA #$ab          ; ..
88ce: 8d 55 59                  STA $5955         ; .UY
88d1: a9 59                     LDA #$59          ; .Y
88d3: 8d 56 59                  STA $5956         ; .VY
88d6: ad 55 59  loc_88d6        LDA $5955         ; .UY
88d9: 85 16                     STA BUFADR+1      ; ..
88db: ad 56 59                  LDA $5956         ; .VY
88de: 85 17                     STA ICCOMT        ; ..
88e0: ae 4a 19                  LDX $194a         ; .J.
88e3: 20 5c 3c                  JSR $3c5c         ;  \<
88e6: a9 21     loc_88e6        LDA #$21          ; .!
88e8: 8d 77 19                  STA UNK_MEMREF_LO_1977  ; .w.
88eb: a9 59                     LDA #$59          ; .Y
88ed: 8d 78 19                  STA UNK_MEMREF_HI_1978  ; .x.
88f0: 4c f3 2f                  JMP $2ff3         ; L./
88f3: a5 31                     LDA CHKSUM        ; .1
88f5: 30 ef                     BMI loc_88e6      ; 0.
88f7: c9 1b                     CMP #$1b          ; ..
88f9: f0 24                     BEQ loc_891f      ; .$
88fb: 20 a5 2b                  JSR $2ba5         ;  .+
88fe: c9 4e                     CMP #$4e          ; .N
8900: f0 1b                     BEQ loc_891d      ; ..
8902: c9 59                     CMP #$59          ; .Y
8904: d0 d0                     BNE loc_88d6      ; ..
8906: a9 08                     LDA #$08          ; ..
8908: 8d 61 19                  STA $1961         ; .a.
890b: a0 00                     LDY #$00          ; ..
890d: b1 41                     LDA (SOUNDR),Y    ; .A
890f: d0 06                     BNE loc_8917      ; ..
8911: 20 57 59                  JSR $5957         ;  WY
8914: 4c 4b 59                  JMP $594b         ; LKY
8917: a0 02     loc_8917        LDY #$02          ; ..
8919: a9 01                     LDA #$01          ; ..
891b: 91 41                     STA (SOUNDR),Y    ; .A
891d: ac f9 ac  loc_891d        LDY $acf9         ; ...
8920: f9 c9 f9                  SBC $f9c9,Y       ; ...
8923: 29 38                     AND #$38          ; )8
8925: 60                        RTS               ; `

8926: 20 2b 29                  JSR $292b         ;  +)
8929: 18                        CLC               ; .
892a: 60                        RTS               ; `

892b: a9 07                     LDA #$07          ; ..
892d: 85 16                     STA BUFADR+1      ; ..
892f: a9 20                     LDA #$20          ; .
8931: 85 17                     STA ICCOMT        ; ..
8933: 20 88 1c                  JSR $1c88         ;  ..
8936: 60                        RTS               ; `

8937: ad 0b 19                  LDA UNK_BYTE_190B  ; ...
893a: 85 09                     STA BOOT          ; ..
893c: ad 0c 19                  LDA UNK_BYTE_190C  ; ...
893f: 85 0a                     STA DOSVEC        ; ..
8941: ad 03 19                  LDA $1903         ; ...
8944: 8d 32 02                  STA SSKCTL        ; .2.
8947: ad 04 19                  LDA $1904         ; ...
894a: 8d 33 02                  STA $0233         ; .3.
894d: ad 07 19                  LDA $1907         ; ...
8950: 85 0b                     STA DOSVEC+1      ; ..
8952: ad 08 19                  LDA $1908         ; ...
8955: 85 0c                     STA DOSINI        ; ..
8957: 20 79 29                  JSR $2979         ;  y)
895a: 30 1a                     BMI loc_8976      ; 0.
895c: a2 0f                     LDX #$0f          ; ..
895e: bd 00 01  loc_895e        LDA $0100,X       ; ...
8961: 9d 80 01                  STA $0180,X       ; ...
8964: ca                        DEX               ; .
8965: 10 f7                     BPL loc_895e      ; ..
8967: a2 03                     LDX #$03          ; ..
8969: bd 05 19  loc_8969        LDA $1905,X       ; ...
896c: dd 80 01                  CMP $0180,X       ; ...
896f: d0 05                     BNE loc_8976      ; ..
8971: ca                        DEX               ; .
8972: 10 f5                     BPL loc_8969      ; ..
8974: e8                        INX               ; .
8975: 60                        RTS               ; `
8976: a9 ff     loc_8976        LDA #$ff          ; ..
8978: 60                        RTS               ; `

8979: 2c 58 02                  BIT LINBUF+17     ; ,X.
897c: 50 08                     BVC loc_8986      ; P.
897e: 2c 5a 02                  BIT LINBUF+19     ; ,Z.
8981: 10 03                     BPL loc_8986      ; ..
8983: 4c f4 f9                  JMP $f9f4         ; L..
8986: a9 02     loc_8986        LDA #$02          ; ..
8988: 85 06                     STA TRAMSZ        ; ..
898a: 20 8e 24  loc_898a        JSR $248e         ;  .$
898d: 10 06                     BPL loc_8995      ; ..
898f: c6 06                     DEC TRAMSZ        ; ..
8991: d0 f7                     BNE loc_898a      ; ..
8993: f0 08                     BEQ loc_899d      ; ..
8995: ee 32 02  loc_8995        INC SSKCTL        ; .2.
8998: d0 03                     BNE loc_899d      ; ..
899a: ee 33 02                  INC $0233         ; .3.
899d: 98        loc_899d        TYA               ; .
899e: 60                        RTS               ; `

899f: a8                        TAY               ; .
89a0: a6 00                     LDX LINZBS        ; ..
89a2: 01 a5                     ORA ($a5,X)       ; ..
89a4: 50 6c                     BVC $8a12         ; Pl
89a6: 65 61                     ADC NEWCOL        ; ea
89a8: 73                        .BYTE $73         ; s
89a9: 65 20                     ADC ICHIDZ        ; e
89ab: 69 6e                     ADC #$6e          ; in
89ad: 73                        .BYTE $73         ; s
89ae: 65 72                     ADC COLAC         ; er
89b0: 74                        .BYTE $74         ; t
89b1: 20 54 68                  JSR $6854         ;  Th
89b4: 65 20                     ADC ICHIDZ        ; e
89b6: 44                        .BYTE $44         ; D
89b7: 75 6e                     ADC BITMSK,X      ; un
89b9: 67                        .BYTE $67         ; g
89ba: 65 6f                     ADC SHFAMT        ; eo
89bc: 6e 20 44                  ROR $4420         ; n D
89bf: 69 73                     ADC #$73          ; is
89c1: 6b                        .BYTE $6b         ; k
89c2: 20 b2 11                  JSR $11b2         ;  ..
89c5: 19 01 0d                  ORA $0d01,Y       ; ...
89c8: 0d a5 53                  ORA $53a5         ; ..S
89cb: 69 64                     ADC #$64          ; id
89cd: 65 20                     ADC ICHIDZ        ; e
89cf: b2                        .BYTE $b2         ; .
89d0: 10 19                     BPL loc_89eb      ; ..
89d2: 01 20                     ORA (ICHIDZ,X)    ; .
89d4: 69 6e                     ADC #$6e          ; in
89d6: 74 6f                     .BYTE $74,$6f     ; to
89d8: 20 61 6e                  JSR $6e61         ;  an
89db: 79 20 64                  ADC $6420,Y       ; y d
89de: 72                        .BYTE $72         ; r
89df: 69 76                     ADC #$76          ; iv
89e1: 65 2e                     ADC ICAX5Z        ; e.
89e3: 0d a6 00                  ORA $a6           ; ...
89e6: 05 a5                     ORA $a5           ; ..
89e8: 50 72                     BVC $8a5c         ; Pr
89ea: 65 73                     ADC COLAC+1       ; es
89ec: 73                        .BYTE $73         ; s
89ed: 20 a1 53                  JSR $53a1         ;  .S
89f0: 50 41                     BVC $8a33         ; PA
89f2: 43                        .BYTE $43         ; C
89f3: 45 20                     EOR ICHIDZ        ; E
89f5: 42                        .BYTE $42         ; B
89f6: 41 52                     EOR (LMARGN,X)    ; AR
89f8: a0 20                     LDY #$20          ; .
89fa: 74 6f                     .BYTE $74,$6f     ; to
89fc: 20 63 6f                  JSR $6f63         ;  co
89ff: 6e                        .BYTE $6e         ; n