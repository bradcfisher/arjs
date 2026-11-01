
; 0000 L3800 @7600 [exe]
* = $7600

7600: 01        ModuleNumber    .BYTE $01            ; Module 1: Combat

7601: 4c be 77  moduleInit      JMP initModule3      ;
7604: 4c 07 76  moduleEntry2    JMP moduleEntry3     ; NOP / RTS
7607: 60        moduleEntry3    RTS                  ; NOP / RTS

7608: 4c 6d 77                  JMP cont_776d        ;

760b: 00        FoeNthZts_L     .BYTE $00            ; Assigned LSB of Zts address (The, 2nd, 3rd, etc)
760c: 00        FoeNthZts_H     .BYTE $00            ; Assigned MSB of Zts address (The, 2nd, 3rd, etc)

                ; Sets FoeNthZts_L/H to the corresponding n-th descriptive string for the foe number.
                ;
                ; Input
                ;   FoeNum        - Current foe number (0..7)
                ;
                ; Output
                ;   FoeNthZts_L/H - Updated to the address of the string describing the relative position of
                ;                   the foe (The, 2nd, 3rd, etc)
                ;
760d: a6 76     setFoeNthZts    LDX FoeNum           ; Set X = FoeNum
760f: ec 00 aa                  CPX FoeCount         ; If (FoeNum >= FoeCount) Then
7612: 90 02                     BCC loc_7616         ;     Set X = 0
7614: a2 00                     LDX #$00             ; End If
7616: bd 43 76  loc_7616        LDA NthZtsTbl_L,X    ; Set
7619: 8d 0b 76                  STA FoeNthZts_L      ;     FoeNthZts_L/H
761c: bd 4b 76                  LDA NthZtsTbl_H,X    ;     to
761f: 8d 0c 76                  STA FoeNthZts_H      ;     NthZtsTbl_L/H[X]
7622: 60                        RTS                  ; Return to caller

7623: 54 68 65  ZtsThe          .BYTE $54,$68,$65    ; "The"
7626: 00                        .BYTE $00            ; "\0"

7627: 32 6e 64  Zts2nd          .BYTE $32,$6e,$64    ; "2nd"
762a: 00                        .BYTE $00            ; "\0"

762b: 33 72 64  Zts3rd          .BYTE $33,$72,$64    ; "3rd"
762e: 00                        .BYTE $00            ; "\0"

762f: 34 74 68  Zts4th          .BYTE $34,$74,$68    ; "4th"
7632: 00                        .BYTE $00            ; "\0"

7633: 35 74 68  Zts5th          .BYTE $35,$74,$68    ; "5th"
7636: 00                        .BYTE $00            ; "\0"

7637: 36 74 68  Zts6th          .BYTE $36,$74,$68    ; "6th"
763a: 00                        .BYTE $00            ; "\0"

763b: 37 74 68  Zts7th          .BYTE $37,$74,$68    ; "7th"
763e: 00                        .BYTE $00            ; "\0"

763f: 38 74 68  Zts8th          .BYTE $38,$74,$68    ; "8th"
7642: 00                        .BYTE $00            ; "\0"

7643: 23 27 2b  NthZtsTbl_L     .BYTE $23,$27,$2b          ; 8 bytes: LSB of Zts address
7646: 2f 33 37 3b 3f            .BYTE $2f,$33,$37,$3b,$3f  ;

764b: 76 76 76  NthZtsTbl_H     .BYTE $76,$76,$76          ; 8 bytes: MSB of Zts address
764e: 76 76 76 76 76            .BYTE $76,$76,$76,$76,$76  ;    0: $7623 [ZtsThe]          4: $7633 [Zts5th]
                                                           ;    1: $7627 [Zts2nd]          5: $7637 [Zts6th]
                                                           ;    2: $762b [Zts3rd]          6: $763b [Zts7th]
                                                           ;    3: $762f [Zts4th]          7: $763f [Zts8th]

7653: a6 00 02  StrNthFoeNmR2   .BYTE $a6,$00,$02                      ; {Col 0 Row 2}

7656: a3 0d 76  StrNthFoeName   .BYTE $a3,$0d,$76                      ; {Call $760d [setFoeNthZts]}
7659: a5                        .BYTE $a5                              ; {Center}
765a: b4 0b 76 03               .BYTE $b4,$0b,$76,$03                  ; {Print zts @ addr in $760b [FoeNthZts_L] wid 3}
765e: 20                        .BYTE $20                              ; " "
765f: b4 01 aa 14               .BYTE $b4,$01,$aa,$14                  ; {Print zts @ addr in $aa01 [FoeNameZts_L] wid 20}
7663: 20                        .BYTE $20                              ; " "
7664: ae                        .BYTE $ae                              ; {Return to prev str}

7665: a6 00 03  StrNthFoeNmR3   .BYTE $a6,$00,$03                      ; {Col 0 Row 3}
7668: a3 6b 76                  .BYTE $a3,$6b,$76                      ; {Call $766b [setStrNthFoeNm]}

                ; Updates the string template address to StrNthFoeName without changing the value of OutRetnAdr_L/H
                ; (e.g. not planning to return here)
                ;
766b: a9 56     setStrNthFoeNm  LDA #$56             ; Set
766d: 85 16                     STA StrTmplate_L     ;     StrTmplate_L/H
766f: a9 76                     LDA #$76             ;     to
7671: 85 17                     STA StrTmplate_H     ;     $7656 [StrNthFoeName]
7673: 60                        RTS                  ; Return to caller

7674: a6 00 07  StrDostYield    .BYTE $a6,$00,$07                      ; {Col 0 Row 7}
7677: a5                        .BYTE $a5                              ; {Center}
7678: 44 6f 73 74 20 74 68 6f   .BYTE $44,$6f,$73,$74,$20,$74,$68,$6f  ; "Dost tho"
7680: 75 20 79 69 65 6c 64 3f   .BYTE $75,$20,$79,$69,$65,$6c,$64,$3f  ; "u yield?"
7688: 20 28                     .BYTE $20,$28                          ; " ("
768a: a1                        .BYTE $a1                              ; {Blink On}
768b: 59                        .BYTE $59                              ; "Y"
768c: a0                        .BYTE $a0                              ; {Blink Off}
768d: 20 6f 72 20               .BYTE $20,$6f,$72,$20                  ; " or "
7691: a1                        .BYTE $a1                              ; {Blink On}
7692: 4e                        .BYTE $4e                              ; "N"
7693: a0                        .BYTE $a0                              ; {Blink Off}
7694: 29 0d                     .BYTE $29,$0d                          ; ")\r"
7696: ff                        .BYTE $ff                              ; {End of string}

7697: 87        CorpseItem      .BYTE $87            ; I0: Type & flags: $80 (held by player) | $07 (special)
7698: 00                        .BYTE $00            ; I1: Item size in bytes (updated to $21 (33) in initCorpseItem)
7699: 02                        .BYTE $02            ; I2: Action trigger - 2 = drop (item is immediately dropped)
769a: 00                        .BYTE $00            ; I3: Alignment requirement (neutral)
769b: 00                        .BYTE $00            ; I4: Weight (updated to Foe_aa1f in sub_84cf)
769c: 1d                        .BYTE $1d            ; I5: Offset from I0 to start of attributes
769d: ff ff ff                  .BYTE $ff,$ff,$ff    ; 23 bytes: Item name (initCorpseItem sets to foe name + " corpse")
76a0: ff ff 00 ff ff ff 00 00   .BYTE $ff,$ff,$00,$ff,$ff,$ff,$00,$00
76a8: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00
76b0: 00 00 00 00               .BYTE $00,$00,$00,$00
76b4: 00                        .BYTE $00            ; End of effects (e.g. no effects)
76b5: 00        CorpseItmAttrs  .BYTE $00            ; 1st attribute byte
76b6: 00                        .BYTE $00            ; 2nd attribute byte
76b7: 00                        .BYTE $00            ; 3rd attribute byte
76b8: 00                        .BYTE $00            ; 4th attribute byte

76b9: 00                        BRK                  ; .
76ba: 00                        BRK                  ; .
76bb: 03 03 03                  .BYTE $03,$03,$03    ; ...
76be: 00                        BRK                  ; .
76bf: 00                        BRK                  ; .
76c0: 00                        BRK                  ; .
76c1: 00                        BRK                  ; .
76c2: 00                        BRK                  ; .
76c3: 00                        BRK                  ; .
76c4: 00                        BRK                  ; .
76c5: 00                        BRK                  ; .
76c6: 00                        BRK                  ; .
76c7: 00                        BRK                  ; .
76c8: 00                        BRK                  ; .
76c9: 00                        BRK                  ; .
76ca: 00                        BRK                  ; .
76cb: 00                        BRK                  ; .
76cc: 00                        BRK                  ; .
76cd: 00                        BRK                  ; .
76ce: 00                        BRK                  ; .
76cf: 00                        BRK                  ; .
76d0: 00                        BRK                  ; .
76d1: 00                        BRK                  ; .
76d2: 00                        BRK                  ; .
76d3: 00                        BRK                  ; .
76d4: 00                        BRK                  ; .
76d5: 00                        BRK                  ; .
76d6: 00                        BRK                  ; .
76d7: 00                        BRK                  ; .
76d8: 00                        BRK                  ; .

76d9: 00        GrbItemName_L   .BYTE $00            ;
76da: 00        GrbItemName_H   .BYTE $00            ;

76db: 00        GenderZts_L     .BYTE $00            ;
76dc: 00        GenderZts_H     .BYTE $00            ;

76dd: 00        FactionNmZts_L  .BYTE $00            ;
76de: 00        FactionNmZts_H  .BYTE $00            ;

76df: 00        ZtsBlank        .BYTE $00            ; An empty string

76e0: 00 00 00  PrvsnAttrSize   .BYTE $00,$00,$00                      ; 12 bytes: Player attribute size in
76e3: 00 00 00 00 01 01 01 01   .BYTE $00,$00,$00,$00,$01,$01,$01,$01  ;           bytes minus one
76eb: 01                        .BYTE $01                              ;

76ec: bb bc bd  PrvsnAttrOfs    .BYTE $bb,$bc,$bd                      ; 12 bytes: Player attribute offset relative
76ef: c1 c0 bf be b7 b9 b1 b3   .BYTE $c1,$c0,$bf,$be,$b7,$b9,$b1,$b3  ;           to $6300 [CHR_STATE]
76f7: b5                        .BYTE $b5                              ;     0: $63bb [InvFood]
                                                                       ;     1: $63bc [InvWater]
                                                                       ;     2: $63bd [InvTorches]
                                                                       ;     3: $63c1 [InvTimepieces]
                                                                       ;     4: $63c0 [InvCompasses]
                                                                       ;     5: $63bf [InvKeys]
                                                                       ;     6: $63be [InvCrystals]
                                                                       ;     7: $63b7 [InvGems_H]
                                                                       ;     8: $63b9 [InvJewels_H]
                                                                       ;     9: $63b1 [InvGold_H]
                                                                       ;    10: $63b3 [InvSilver_H]
                                                                       ;    11: $63b5 [InvCopper_H]

76f8: 4c 3c 86                  JMP cont_863c        ;
76fb: 4c 0d 88                  JMP cont_880d        ;
76fe: 4c 64 88                  JMP contRndFoeWpn    ; Randomly selects a foe weapon & continues @ $863c [cont_863c]
7701: 4c 80 88                  JMP cont_8880        ;
7704: 4c 98 88                  JMP cont_8898        ;
7707: 4c 82 94                  JMP sub_9482         ;
770a: 4c d1 8e                  JMP dsplyMsg4Secs    ; Displays the message at the address in Y/X for 4 seconds
770d: 4c ce 8e                  JMP dsplyMsg2Secs    ; Displays the message at the address in Y/X for 2 seconds
7710: 4c a5 7e                  JMP getItemPrvsnNm   ; Assigns GrbItemName_L/H to the Zts name of the specified
                                                     ;     provision type (dat_0094 >= 0) or item (dat_0094 < 0).
7713: 4c f9 8e                  JMP applyUpdates     ; Execute item triggers and stat re-calcs
7716: 4c 53 8a                  JMP cont_8a53        ;
7719: 4c 9e 7c                  JMP cont_7c9e        ;
771c: 4c 53 78                  JMP loc_7853         ;
771f: 4c 5d 78                  JMP cont_785d        ;
7722: 4c f0 94                  JMP lockDroppdItms   ; Sets bit 7 on all entries of DroppedGame
7725: 4c d1 7d                  JMP loc_7dd1         ;
7728: 4c ef 8e                  JMP dsplyTmpltStr    ; Displays the template string at the address in Y/X.
772b: 4c d2 8f                  JMP readYorN         ; Waits for the player to press 'Y' or 'N' (case-insensitive).
                                                     ;     If the player is inebriated, there is a chance this will
                                                     ;     automatically report 'Y' was pressed regardless of the
                                                     ;     player's selection. The more drunk, the more likely this
                                                     ;     will occur.
772e: 4c f9 79                  JMP cont_79f9        ;
7731: 4c 6f 88                  JMP sub_886f         ;
7734: 4c a7 8e                  JMP sub_8ea7         ;
7737: 4c 80 92                  JMP waitForVblankC   ; Waits for a vertical blank to occur
773a: 4c ed 84                  JMP loc_84ed         ;
773d: 4c cb 8c                  JMP sub_8ccb         ;
7740: 4c 74 8d                  JMP cont_8d74        ;
7743: 4c 1c 90                  JMP getMenuSel       ; Pauses game time progression and waits for the player to select
                                                     ;     a menu item.
7746: 4c 38 7d                  JMP loc_7d38         ;
7749: 4c 34 97                  JMP sub_9734         ;
774c: 4c 67 90                  JMP clrSmthngHere    ; Clears row 5 of the top text area
                                                     ;     (e.g. "There is something here", etc)
774f: 4c 3e 8b                  JMP sub_8b3e         ;
7752: 4c bb 8c                  JMP cont_8cbb        ;
7755: 4c 80 8b                  JMP cont_8b80        ;
7758: 4c 60 85                  JMP initCorpseItem   ; Populates byte size and item name details into the CorpseItem
                                                     ;     and sets DestAdr_L/H to $76b5 [CorpseItmAttrs].
775b: 4c 98 85                  JMP addCorpseItem    ; Assigns CorpseItem attributes and adds the item to the game
                                                     ;     inventory.
775e: 4c 0d 8f                  JMP sub_8f0d         ;
7761: 4c 75 94                  JMP sub_9475         ;
7764: 4c 81 90                  JMP sub_9081         ;
7767: 4c cd 90                  JMP rmveAllDropped   ; Unlocks and removes all dropped dungeon items present at the
                                                     ;     player's current location
776a: 4c 7f 8e                  JMP shwMsgAndUpdt    ; Displays a message, waits for any key to be pressed and applies
                                                     ;     item trigger and stat updates.

                ;
                ;
                ;
776d: 20 31 97  cont_776d       JSR sub_9731         ; Call $9731 [sub_9731]
7770: 20 f9 8e                  JSR applyUpdates     ; Call $8ef9 [applyUpdates]
7773: 20 72 92                  JSR unlkDroppdItms   ; Call $9272 [unlkDroppdItms]
7776: a2 00                     LDX #$00             ; Set X = 0
7778: 20 26 98                  JSR sub_9826         ; Call $9826 [sub_9826]
777b: a9 ff                     LDA #$ff             ; Set A = $ff
777d: 2c 70 98                  BIT dat_9870         ; If (dat_9870 < 0) Then
7780: 10 03                     BPL loc_7785         ;     Set MapNumber = $ff
7782: 8d 00 ac                  STA MapNumber        ; End If
7785: 8d f0 96  loc_7785        STA TextureStart     ; Set TextureStart = $ff
7788: 8d 59 19                  STA MapLocSpclType   ; Set MapLocSpclType = $ff
778b: ad 5b 19                  LDA dat_195b         ; Set
778e: 8d 16 63                  STA CHR_FRAC_LOC_X   ;     CHR_FRAC_LOC_X = dat_195b
7791: ad 5c 19                  LDA dat_195c         ; Set
7794: 8d 17 63                  STA CHR_FRAC_LOC_Y   ;     CHR_FRAC_LOC_Y = dat_195c
7797: a9 00                     LDA #$00             ; Set
7799: 8d 58 19                  STA PendingSpclFlg   ;     PendingSpclFlg = 0
779c: 8d 37 19                  STA AllowActions     ; Set AllowActions = 0
779f: ce 5f 19                  DEC StatUpdateFlg    ; Subtract 1 from StatUpdateFlg
77a2: ce 60 19                  DEC ItemStatUpdFlg   ; Subtract 1 from ItemStatUpdFlg
77a5: 20 4e 18                  JSR j_remStatPage    ; Call $184e [j_remStatPage]
77a8: a6 72                     LDX dat_0072         ; Set
77aa: 9a                        TXS                  ;     stack pointer = dat_0072
77ab: ad 8a 75                  LDA dat_758a         ; If ((dat_758a | dat_758b) == 0)
77ae: 0d 8b 75                  ORA dat_758b         ; Then
77b1: d0 03                     BNE loc_77b6         ;     Continue @ $3183 [j_sub_3183]
77b3: 4c 0c 18                  JMP j_sub_3183       ; End If
77b6: a9 02     loc_77b6        LDA #$02             ; Set
77b8: 8d 1e 63                  STA CurrentModule    ;     CurrentModule = 2                (2 = Item data module)
77bb: 4c 03 18                  JMP j_loadModule     ; Continue @ $1803 [j_loadModule]

                ;
                ;
                ;
77be: a9 ff     initModule3     LDA #$ff             ; Set
77c0: 8d 37 19                  STA AllowActions     ;     AllowActions = $ff
77c3: a9 fa                     LDA #$fa             ; Set
77c5: 8d 77 19                  STA cont_addr_1977_L ;     cont_addr_1977_L/H
77c8: a9 77                     LDA #$77             ;     to
77ca: 8d 78 19                  STA cont_addr_1977_H ;     $77fa [cont_77fa]
77cd: a9 81                     LDA #$81             ; Set
77cf: 85 16                     STA StrTmplate_L     ;     StrTmplate_L/H
77d1: a9 98                     LDA #$98             ;     to
77d3: 85 17                     STA StrTmplate_H     ;     $9881 [StrClearRows]
77d5: 20 4b 18                  JSR j_addStatPage    ; Call $184b [j_addStatPage]
77d8: ae 33 19                  LDX CurStatusPage    ; Set
77db: 8e 92 a8                  STX ModuleStatusPg   ;     ModuleStatusPg = CurStatusPage
77de: a9 00                     LDA #$00             ; Set
77e0: 8d 5d 19                  STA EncounterFlg     ;     EncounterFlg = 0
77e3: 8d 2f 02                  STA vblk_CRITIC      ; Set vblk_CRITIC = 0
77e6: 8d 8a 75                  STA dat_758a         ; Set dat_758a = 0
77e9: 8d 8b 75                  STA dat_758b         ; Set dat_758b = 0
77ec: 20 27 98                  JSR clrCmpssArrws    ; Call $9827 [clrCmpssArrws]
77ef: a9 58                     LDA #$58             ; Set
77f1: 8d 24 02                  STA VVBLKD           ;     VVBLKD[0..1]
77f4: a9 97                     LDA #$97             ;     to
77f6: 8d 25 02                  STA VVBLKD+1         ;     $9758 [VVBLKD_9758]
77f9: 60                        RTS                  ; Return to caller

                ; Continuation entry point from main game loop
                ;
77fa: ba        cont_77fa       TSX                  ; Set X = stack pointer
77fb: 86 72                     STX dat_0072         ; Set dat_0072 = X
77fd: a9 00                     LDA #$00             ; Set
77ff: 8d 8e 63                  STA CHR_638e         ;     CHR_638e = 0
7802: 85 97                     STA dat_0097         ; Set dat_0097 = 0
7804: 20 00 aa                  JSR sub_aa00         ; Call $aa00 [sub_aa00]
7807: 20 59 7b                  JSR sub_7b59         ; Call $7b59 [sub_7b59]
780a: ad 8e 63                  LDA CHR_638e         ; If (CHR_638e == 0)
780d: d0 15                     BNE loc_7824         ; Then
780f: ad 81 63                  LDA ChrTreasureFnd   ;     Set A = ChrTreasureFnd
7812: 20 d5 94                  JSR sub_94d5         ;     Call $94d5 [sub_94d5]
7815: b0 02                     BCS loc_7819         ;     If (C == 1) Then
7817: e6 97                     INC dat_0097         ;         Add 1 to dat_0097
                                                     ;     End If
7819: ad 10 aa  loc_7819        LDA dat_aa10         ;     Set A = dat_aa10
781c: 20 d5 94                  JSR sub_94d5         ;     Call $94d5 [sub_94d5]
781f: b0 03                     BCS loc_7824         ;     If (C == 0) Then
7821: ee 8e 63                  INC CHR_638e         ;         Add 1 to CHR_638e
                                                     ;     End If
                                                     ; End If
7824: a5 97     loc_7824        LDA dat_0097         ; If
7826: 4d 8e 63                  EOR CHR_638e         ;    ((dat_0097 ^ CHR_638e) != 0)  (at least 1 bit set in only one)
7829: f0 28                     BEQ loc_7853         ; Then
782b: a5 97                     LDA dat_0097         ;     If (dat_0097 != 0)
782d: f0 07                     BEQ loc_7836         ;     Then
782f: 20 d2 7d                  JSR sub_7dd2         ;         Call $7dd2 [sub_7dd2]
7832: b0 29                     BCS cont_785d        ;         If (C == 1) Then
                                                     ;             Continue @ $785d [cont_785d]
                                                     ;         End If
7834: 90 45                     BCC loc_787b         ;         Continue @ $787b [loc_787b]
                                                     ;     End If
7836: a2 98     loc_7836        LDX #$98             ;     Set
7838: a0 83                     LDY #$83             ;         Y/X = $9883 [StrSurprised]
783a: 20 d1 8e                  JSR dsplyMsg4Secs    ;     Call $8ed1 [dsplyMsg4Secs]   (in Y/X)
783d: ce 8e 63                  DEC CHR_638e         ;     Subtract 1 from CHR_638e
7840: ad 14 aa                  LDA FoeSrprseYou_H   ;     Set A = FoeSrprseYou_H
7843: f0 06                     BEQ loc_784b         ;     If (A != 0) Then
7845: ae 13 aa                  LDX FoeSrprseYou_L   ;         Set X = FoeSrprseYou_L
7848: 4c e7 94                  JMP contAtAddrXA     ;         Continue @ $94e7 [contAtAddrXA] (in X/A)
                                                     ;     End If
784b: ad 16 aa  loc_784b        LDA FoePreEncntr_H   ;     If (FoePreEncntr_H == 0)
784e: d0 03                     BNE loc_7853         ;     Then
7850: 4c f9 79                  JMP cont_79f9        ;         Continue @ $79f9 [cont_79f9]
                                                     ;     End If
                                                     ; End If
7853: a9 00     loc_7853        LDA #$00             ; Set
7855: 85 97                     STA dat_0097         ;     dat_0097 = 0
7857: 8d 8e 63                  STA CHR_638e         ; Set CHR_638e = 0
785a: 20 c6 7d                  JSR doFoePreEncntr   ; Call $7dc6 [doFoePreEncntr]
785d: a9 40     cont_785d       LDA #$40             ; Set A = $40 (64)
785f: 20 99 18                  JSR j_randInRange    ; Call $1899 [j_randInRange]  (in A, output in A)
7862: 18                        CLC                  ; Set
7863: 6d 2a aa                  ADC FoeSpd           ;     A = A + FoeSpd
7866: b0 10                     BCS loc_7878         ; If (C == 0) Then
7868: 85 96                     STA dat_0096         ;     Set dat_0096 = A
786a: a9 40                     LDA #$40             ;     Set A = $40 (64)
786c: 20 99 18                  JSR j_randInRange    ;     Call $1899 [j_randInRange]  (in A, output in A)
786f: 6d 79 63                  ADC ChrSpdCalc       ;     Set A = A + ChrSpdCalc
7872: b0 07                     BCS loc_787b         ;     If (C == 0) And (A < dat_0096) Then
7874: c5 96                     CMP dat_0096         ;         Continue @ $79f9 [cont_79f9]
                                                     ;     End If
7876: b0 03                     BCS loc_787b         ; Else
7878: 4c f9 79  loc_7878        JMP cont_79f9        ;     Continue @ $79f9 [cont_79f9]
                                                     ; End If
787b: a9 00     loc_787b        LDA #$00             ; Set
787d: 85 a0                     STA dat_00a0         ;     dat_00a0 = 0
787f: 85 a1                     STA dat_00a1         ; Set dat_00a1 = 0
7881: 85 9b                     STA dat_009b         ; Set dat_009b = 0
7883: 85 7d                     STA dat_007d         ; Set dat_007d = 0
7885: 20 f0 94  loc_7885        JSR lockDroppdItms   ; Call $94f0 [lockDroppdItms]
7888: a5 91                     LDA dat_0091         ; If (dat_0091 != 0)
788a: f0 0a                     BEQ loc_7896         ; Then
788c: a2 03                     LDX #$03             ;     Set X = 3
788e: 86 a0                     STX dat_00a0         ;     Set dat_00a0 = 3
7890: ca                        DEX                  ;     Subtract 1 from X  (X = 2)
7891: 86 9b                     STX dat_009b         ;     Set dat_009b = 2
7893: 20 72 92                  JSR unlkDroppdItms   ;     Call $9272 [unlkDroppdItms]
                                                     ; End If
7896: a9 00     loc_7896        LDA #$00             ; Set
7898: 85 92                     STA dat_0092         ;     dat_0092 = 0
789a: a2 15                     LDX #$15             ; Set X = $15 (22 iterations [21..0])
789c: 9d dd 63  loc_789c        STA Chr_BluntDmg,X   ; Loop
                                                     ;     Set Chr_BluntDmg[X] = 0
789f: ca                        DEX                  ;     Subtract 1 from X
78a0: 10 fa                     BPL loc_789c         ; Repeat while (X >= 0)
78a2: 85 a7                     STA dat_00a7_H       ; Set dat_00a7_H = 0
78a4: 85 a8                     STA dat_00a8_L       ; Set dat_00a8_L = 0
78a6: 20 f9 8e                  JSR applyUpdates     ; Call $8ef9 [applyUpdates]
78a9: ad 45 63                  LDA ChrHp_H          ; If
78ac: 0d 46 63                  ORA ChrHp_L          ;    ((ChrHp_H | ChrHp_L) == 0)
78af: d0 03                     BNE loc_78b4         ; Then
78b1: 4c 42 7b                  JMP contPlayerDied   ;     Continue @ $7b42 [contPlayerDied]
                                                     ; End If
78b4: ad 8e 63  loc_78b4        LDA CHR_638e         ; If (CHR_638e != 0)
78b7: f0 0a                     BEQ loc_78c3         ; Then
78b9: a2 9d                     LDX #$9d             ;     Set
78bb: a0 97                     LDY #$97             ;         Y/X = $9d97 [StrUAreStunned]
78bd: 20 d1 8e                  JSR dsplyMsg4Secs    ;     Call $8ed1 [dsplyMsg4Secs]   (in Y/X)
78c0: 4c f9 79                  JMP cont_79f9        ;     Continue @ $79f9 [cont_79f9]
                                                     ; End If
78c3: a5 8a     loc_78c3        LDA dat_008a         ; If (dat_008a < 0) Then
78c5: 30 02                     BMI loc_78c9         ;     Continue @ $7ac2 [cont_7ac2]
78c7: d0 03                     BNE loc_78cc         ; Else
78c9: 4c c2 7a  loc_78c9        JMP cont_7ac2        ;     If (FoeCount <= 0) Then
78cc: ad 00 aa  loc_78cc        LDA FoeCount         ;         Continue @ $7ac2 [cont_7ac2]
78cf: f0 f8                     BEQ loc_78c9         ;     End If
78d1: 30 f6                     BMI loc_78c9         ; End If
78d3: a9 f0                     LDA #$f0             ; Set
78d5: 8d 93 a8                  STA dat_a893         ;     dat_a893 = $f0
78d8: a9 ff                     LDA #$ff             ; Set
78da: 8d 61 19                  STA dat_1961         ;     dat_1961 = $ff
78dd: a2 9a     contBattlOptns  LDX #$9a             ; Set
78df: a0 4b                     LDY #$4b             ;     Y/X = $9a4b [StrBattleOptns]
78e1: 20 ef 8e                  JSR dsplyTmpltStr    ; Call $8eef [dsplyTmpltStr] (in Y/X)
78e4: ad 52 02  loc_78e4        LDA VBlankCounter    ; Loop
                                                     ;     Set A = VBlankCounter
78e7: cd 52 02  loc_78e7        CMP VBlankCounter    ;     Loop
78ea: f0 fb                     BEQ loc_78e7         ;     Repeat while (A == VBlankCounter)           (wait for vblank)
78ec: ce 93 a8                  DEC dat_a893         ;     Subtract 1 from dat_a893
78ef: f0 75                     BEQ cont_7966        ;     If (dat_a893 == 0) Then
                                                     ;         Continue @ $7966 [cont_7966]
                                                     ;     End If
78f1: a9 00                     LDA #$00             ;     Set
78f3: 8d 37 19                  STA AllowActions     ;         AllowActions = 0
78f6: a9 06                     LDA #$06             ;     Set
78f8: 8d 94 a8                  STA dat_a894         ;         dat_a894 = 6
78fb: a9 08                     LDA #$08             ;     Set
78fd: 8d 77 19                  STA cont_addr_1977_L ;         cont_addr_1977_L/H
7900: a9 79                     LDA #$79             ;         to
7902: 8d 78 19                  STA cont_addr_1977_H ;         $7908 [cont_7908]            (return to next instruction)
7905: 4c 06 18                  JMP j_sub_2ff3       ;     Call $2ff3 [j_sub_2ff3]
7908: ce 37 19  cont_7908       DEC AllowActions     ;     Subtract 1 from AllowActions
790b: 2c 61 19                  BIT dat_1961         ;     If (dat_1961 < 0)
790e: 10 56                     BPL cont_7966        ;     Then
                                                     ;         Continue @ $7966 [cont_7966]
                                                     ;     End If
7910: a5 31                     LDA KbdChar          ; Repeat
7912: 30 d0                     BMI loc_78e4         ;    while (KbdChar >= 0)
7914: 38                        SEC                  ; Set
7915: e9 30                     SBC #$30             ;     A = A - $30 (48)
7917: c9 06                     CMP #$06             ; If (A >= 6) Then
7919: b0 c2                     BCS contBattlOptns   ;     Continue @ $78dd [contBattlOptns]
                                                     ; End If
791b: 8d 94 a8                  STA dat_a894         ; Set dat_a894 = A
791e: c9 04                     CMP #$04             ; If
7920: f0 1f                     BEQ loc_7941         ;    (dat_a894 != 4)                     (4 = Transact)
7922: ad 68 19                  LDA EffInebrLvl      ;    And
7925: f0 1a                     BEQ loc_7941         ;    (EffInebrLvl != 0)
7927: 0a                        ASL                  ; Then
7928: 0a                        ASL                  ;     Set
7929: 0a                        ASL                  ;         smc_7931[1]
792a: 0a                        ASL                  ;            =
792b: 8d 32 79                  STA smc_7931+1       ;              EffInebrLvl >>> 4
792e: ad 0a d2                  LDA RANDOM           ;     If
7931: c9 ff                     CMP #$ff             ;        (random byte < smc_7931[1])
7933: b0 0c                     BCS loc_7941         ;     Then
7935: a9 04                     LDA #$04             ;         Set
7937: 8d 94 a8                  STA dat_a894         ;             dat_a894 = 4
793a: a2 9d                     LDX #$9d             ;         Set
793c: a0 32                     LDY #$32             ;             Y/X = $9d32 [StrDrunkRsning]
793e: 20 d1 8e                  JSR dsplyMsg4Secs    ;         Call $8ed1 [dsplyMsg4Secs]   (in Y/X)
                                                     ;     End If
                                                     ; End If
7941: ad 94 a8  loc_7941        LDA dat_a894         ; If
7944: c9 05                     CMP #$05             ;    (dat_a894 == 5)                 (5 = switch weapons)
7946: d0 1e                     BNE cont_7966        ; Then
7948: ae 9c 63                  LDX ChrPriWeapon     ;     Set X = ChrPriWeapon
794b: ac 9d 63                  LDY ChrSecWeapon     ;     Set Y = ChrSecWeapon
794e: 8e 9d 63                  STX ChrSecWeapon     ;     Set ChrSecWeapon = X
7951: 8c 9c 63                  STY ChrPriWeapon     ;     Set ChrPriWeapon = Y
7954: 20 7e 8d                  JSR sub_8d7e         ;     Call $8d7e [sub_8d7e]
7957: a2 a0                     LDX #$a0             ;     Set
7959: a0 c1                     LDY #$c1             ;         Y/X = $a0c1 [StrSwitchingTo]
795b: 20 ef 8e                  JSR dsplyTmpltStr    ;     Call $8eef [dsplyTmpltStr] (in Y/X)
795e: a9 01                     LDA #$01             ;     Set A = 1
7960: 20 5a 18                  JSR j_waitSeconds    ;     Call $185a [j_waitSeconds] (in A)
7963: 4c dd 78                  JMP contBattlOptns   ;     Continue @ $78dd [contBattlOptns]
                                                     ; End If
7966: a5 91     cont_7966       LDA dat_0091         ; If (dat_0091 != 0) Then
7968: f0 02                     BEQ loc_796c         ;     Subtract 1 from dat_0091
796a: c6 91                     DEC dat_0091         ; End If
796c: 20 ce 7e  loc_796c        JSR sub_7ece         ; Call $7ece [sub_7ece]
796f: 20 d0 92                  JSR sub_92d0         ; Call $92d0 [sub_92d0]
7972: a5 a7                     LDA dat_00a7_H       ; If ((dat_00a7_H | dat_00a8_L) != 0)
7974: 05 a8                     ORA dat_00a8_L       ; Then
7976: f0 03                     BEQ loc_797b         ;     Call $948d [sub_948d]
7978: 20 8d 94                  JSR sub_948d         ; End If
797b: 20 24 91  loc_797b        JSR grantExp         ; Call $9124 [grantExp]
797e: ad 94 a8                  LDA dat_a894         ; If
7981: c9 04                     CMP #$04             ;    (dat_a894 == 4)
7983: d0 1b                     BNE loc_79a0         ;    And
7985: a5 97                     LDA dat_0097         ;    (dat_0097 != 0)
7987: f0 17                     BEQ loc_79a0         ; Then
7989: c6 97                     DEC dat_0097         ;     Subtract 1 from dat_0097
798b: e6 a0                     INC dat_00a0         ;     Add 2
798d: e6 a0                     INC dat_00a0         ;           to dat_00a0
798f: e6 9b                     INC dat_009b         ;     Add 3
7991: e6 9b                     INC dat_009b         ;           to
7993: e6 9b                     INC dat_009b         ;              dat_009b
7995: ad 21 aa                  LDA Foe_aa21         ;     Set Foe_aa21
7998: 09 20                     ORA #$20             ;            =
799a: 8d 21 aa                  STA Foe_aa21         ;              Foe_aa21 | $20
799d: 4c 7b 78                  JMP loc_787b         ;     Continue @ $787b [loc_787b]
                                                     ; End If
79a0: a9 00     loc_79a0        LDA #$00             ; Set
79a2: 85 76                     STA FoeNum           ;     FoeNum = 0
79a4: 20 c5 94  loc_79a4        JSR sub_94c5         ; Loop
                                                     ;     Call $94c5 [sub_94c5]
79a7: e6 76                     INC FoeNum           ;     Add 1 to FoeNum
79a9: a5 76                     LDA FoeNum           ; Repeat
79ab: cd 00 aa                  CMP FoeCount         ;    while
79ae: 90 f4                     BCC loc_79a4         ;       (FoeNum < FoeCount)
79b0: 20 19 92                  JSR sub_9219         ; Call $9219 [sub_9219]
79b3: ad 00 aa                  LDA FoeCount         ; If (FoeCount == 0) Then
79b6: d0 03                     BNE loc_79bb         ;     Continue @ $7ac2 [cont_7ac2]
79b8: 4c c2 7a                  JMP cont_7ac2        ; End If
79bb: 24 a5     loc_79bb        BIT dat_00a5         ; If (dat_00a5 < 0)                         (player knocked down)
79bd: 10 31                     BPL loc_79f0         ; Then
79bf: a5 91                     LDA dat_0091         ;     If (dat_0091 == 0)
79c1: d0 20                     BNE loc_79e3         ;     Then
79c3: a9 00                     LDA #$00             ;         Set
79c5: 85 76                     STA FoeNum           ;             FoeNum = 0
79c7: ac 00 aa                  LDY FoeCount         ;         Set Y = FoeCount
79ca: 20 09 95  loc_79ca        JSR sub_9509         ;         Loop
                                                     ;             Call $9509 [sub_9509] (in FoeNum; out X, C=0)
79cd: b5 c2                     LDA dat_00c2,X       ;             If               (TODO: where is X set? sub output?)
79cf: 15 c3                     ORA dat_00c3,X       ;                ((dat_00c2[X] | dat_00c3[X]) == 0)
79d1: f0 06                     BEQ loc_79d9         ;             Then
                                                     ;                 Exit Loop
                                                     ;             End If
79d3: 88                        DEY                  ;             Subtract 1 from Y
79d4: d0 f4                     BNE loc_79ca         ;         Repeat while (Y != 0)
79d6: 4c e3 79                  JMP loc_79e3         ;         If (Y != 0) Then              (exited loop early)
79d9: ad 49 63  loc_79d9        LDA ChrStaCalc       ;            Set A = ChrStaCalc
79dc: a2 03                     LDX #$03             ;             Set X = 3
79de: 20 0d 8f                  JSR sub_8f0d         ;             Call $8f0d [sub_8f0d] (in A, X)
79e1: 30 0d                     BMI loc_79f0         ;             If (N == 1) Then
                                                     ;                 Continue @ $79f0 [loc_79f0]
                                                     ;             End If
                                                     ;         End If
                                                     ;     End If
79e3: a5 a5     loc_79e3        LDA dat_00a5         ;     Set dat_00a5
79e5: 29 7f                     AND #$7f             ;            =
79e7: 85 a5                     STA dat_00a5         ;              dat_00a5 & $7f
79e9: a2 a2                     LDX #$a2             ;     Set
79eb: a0 4e                     LDY #$4e             ;         Y/X = $a24e [StrRiseFrmGrnd]
79ed: 20 ce 8e                  JSR dsplyMsg2Secs    ;     Call $8ece [dsplyMsg2Secs]   (in Y/X)
                                                     ; End If
79f0: a5 92     loc_79f0        LDA dat_0092         ; If
79f2: 05 91                     ORA dat_0091         ;    ((dat_0092 | dat_0091) != 0)
79f4: f0 03                     BEQ cont_79f9        ; Then
79f6: 4c 85 78                  JMP loc_7885         ;     Continue @ $7885 [loc_7885]
                                                     ; End If
79f9: ad 00 aa  cont_79f9       LDA FoeCount         ; If (FoeCount == 0) Then
79fc: d0 03                     BNE loc_7a01         ; Then
79fe: 4c c2 7a                  JMP cont_7ac2        ;     Continue @ $7ac2 [cont_7ac2]
                                                     ; End If
7a01: a9 00     loc_7a01        LDA #$00             ; Set
7a03: 85 76                     STA FoeNum           ;     FoeNum = 0
7a05: 20 c5 94  loc_7a05        JSR sub_94c5         ; Call $94c5 [sub_94c5]
7a08: b0 49                     BCS cont_7a53        ; If (C == 0) Then
7a0a: 20 09 95                  JSR sub_9509         ;     Call $9509 [sub_9509] (in FoeNum; out X, C=0)
7a0d: ad 20 aa                  LDA Foe_aa20         ;     If
7a10: 29 10                     AND #$10             ;        (Foe_aa20 & $10 != 0)
7a12: f0 06                     BEQ loc_7a1a         ;     Then
7a14: a9 00                     LDA #$00             ;         Set
7a16: 95 c2                     STA dat_00c2,X       ;             dat_00c2[X] = 0
7a18: 85 97                     STA dat_0097         ;         Set dat_0097 = 0
                                                     ;     End If
7a1a: b5 c2     loc_7a1a        LDA dat_00c2,X       ;     If (dat_00c2[X])
7a1c: f0 0a                     BEQ loc_7a28         ;     Then
7a1e: a2 99                     LDX #$99             ;         Set
7a20: a0 0d                     LDY #$0d             ;             Y/X = $990d [StrIsStunned]
7a22: 20 ce 8e                  JSR dsplyMsg2Secs    ;             Call $8ece [dsplyMsg2Secs]   (in Y/X)
7a25: 4c 53 7a                  JMP cont_7a53        ;     Else If
7a28: b5 c3     loc_7a28        LDA dat_00c3,X       ;        (dat_00c3[X] < 0)
7a2a: 10 21                     BPL loc_7a4d         ;     Then
7a2c: ad 27 aa                  LDA FoeInt           ;         Set A = FoeInt
7a2f: a2 03                     LDX #$03             ;         Set X = 3
7a31: 20 15 8f                  JSR sub_8f15         ;         Call $8f15 [sub_8f15] (in A, X)
7a34: 30 0d                     BMI loc_7a43         ;         If (N == 0) Then
7a36: 20 09 95                  JSR sub_9509         ;             Call $9509 [sub_9509] (in FoeNum; out X, C=0)
7a39: a9 00                     LDA #$00             ;             Set
7a3b: 95 c3                     STA dat_00c3,X       ;                 dat_00c3[X] = 0
7a3d: a2 9c                     LDX #$9c             ;             Set
7a3f: a0 b3                     LDY #$b3             ;                 Y/X = $9cb3 [StrBreaksSpell]
7a41: d0 04                     BNE loc_7a47         ;         Else
7a43: a2 a1     loc_7a43        LDX #$a1             ;             Set
7a45: a0 e7                     LDY #$e7             ;                 Y/X = $a1e7 [StrIsBewildrd]
                                                     ;         End If
7a47: 20 ce 8e  loc_7a47        JSR dsplyMsg2Secs    ;         Call $8ece [dsplyMsg2Secs]   (in Y/X)
7a4a: 4c 53 7a                  JMP cont_7a53        ;     Else
7a4d: 20 de 85  loc_7a4d        JSR sub_85de         ;         Call $85de [sub_85de]
7a50: 20 c5 94                  JSR sub_94c5         ;         Call $94c5 [sub_94c5]
                                                     ;     End If
                                                     ; End If
7a53: ad 00 aa  cont_7a53       LDA FoeCount         ; If (FoeCount != 0)
7a56: f0 6a                     BEQ cont_7ac2        ; Then
7a58: 20 f9 8e                  JSR applyUpdates     ;     Call $8ef9 [applyUpdates]
7a5b: e6 76                     INC FoeNum           ;     Add 1 to FoeNum
7a5d: a5 76                     LDA FoeNum           ;     If (FoeNum >= FoeCount) Then
7a5f: cd 00 aa                  CMP FoeCount         ;         Continue @ $7a05 [loc_7a05]
7a62: 90 a1                     BCC loc_7a05         ;     End If
7a64: ac 00 aa                  LDY FoeCount         ;     Set Y = FoeCount
7a67: a2 00                     LDX #$00             ;     Set X = 0
7a69: b5 c2     loc_7a69        LDA dat_00c2,X       ;     Loop
7a6b: f0 02                     BEQ loc_7a6f         ;         If (dat_00c2[X] != 0) Then
7a6d: d6 c2                     DEC dat_00c2,X       ;             Subtract 1 from dat_00c2[X]
                                                     ;         End If
7a6f: e8        loc_7a6f        INX                  ;         Add 2
7a70: e8                        INX                  ;               to X
7a71: 88                        DEY                  ;         Subtract 1 from Y
7a72: d0 f5                     BNE loc_7a69         ;     Repeat while (Y != 0)
7a74: 20 19 92                  JSR sub_9219         ;     Call $9219 [sub_9219]
7a77: ad 8e 63                  LDA CHR_638e         ;     If (CHR_638e != 0) Then
7a7a: f0 03                     BEQ loc_7a7f         ;         Subtract 1 from CHR_638e
7a7c: ce 8e 63                  DEC CHR_638e         ;     End If
7a7f: ad 00 aa  loc_7a7f        LDA FoeCount         ;     If (FoeCount != 0)
7a82: f0 3e                     BEQ cont_7ac2        ;     Then
7a84: 20 19 92                  JSR sub_9219         ;         Call $9219 [sub_9219]
7a87: 20 72 90                  JSR sub_9072         ;         Call $9072 [sub_9072]
7a8a: 24 c3                     BIT dat_00c3         ;         If ((dat_00c3 & $40) != 0)
7a8c: 50 1e                     BVC loc_7aac         ;         Then
7a8e: a5 a5                     LDA dat_00a5         ;             If
7a90: 0d 8e 63                  ORA CHR_638e         ;               ((dat_00a5 | CHR_638e) == 0)
7a93: d0 0a                     BNE loc_7a9f         ;             Then
7a95: ad 24 aa                  LDA FoeSta           ;                 Set A = FoeSta
7a98: a2 03                     LDX #$03             ;                 Set X = 3
7a9a: 20 15 8f                  JSR sub_8f15         ;                 Call $8f15 [sub_8f15] (in A, X)
7a9d: 30 0d                     BMI loc_7aac         ;                 If (N == 1) Then
                                                     ;                     Continue @ 7aac [loc_7aac]
                                                     ;                 End If
                                                     ;             End If
7a9f: a5 c3     loc_7a9f        LDA dat_00c3         ;             Set dat_00c3
7aa1: 29 bf                     AND #$bf             ;                    =
7aa3: 85 c3                     STA dat_00c3         ;                      dat_00c3 & $bf (1011_1111)
7aa5: a2 a2                     LDX #$a2             ;             Set
7aa7: a0 6d                     LDY #$6d             ;                 Y/X = $a26d [StrGetsUp]
7aa9: 20 ce 8e                  JSR dsplyMsg2Secs    ;             Call $8ece [dsplyMsg2Secs]   (in Y/X)
                                                     ;         End If
7aac: ee 9e a8  loc_7aac        INC dat_a89e         ;         Add 1 to dat_a89e
7aaf: a5 ac                     LDA dat_00ac         ;         If
7ab1: 05 ab                     ORA dat_00ab         ;            ((dat_00ac | dat_00ab) == 0)
7ab3: d0 0a                     BNE loc_7abf         ;            And
7ab5: ad 9e a8                  LDA dat_a89e         ;            (dat_a89e > 4)
7ab8: c9 04                     CMP #$04             ;         Then
7aba: 90 03                     BCC loc_7abf         ;             Continue @ $8d74 [loc_787b]
7abc: 4c 74 8d                  JMP cont_8d74        ;         End If
7abf: 4c 7b 78  loc_7abf        JMP loc_787b         ;         Continue @ $787b [loc_787b]
                                                     ;     End If
                                                     ; End If

                ;
                ;
                ;
7ac2: ad 59 19  cont_7ac2       LDA MapLocSpclType   ; If (MapLocSpclType == 0)
7ac5: d0 0b                     BNE loc_7ad2         ; Then
7ac7: ad 5a 19                  LDA MapLocSpclNum    ;     Set A = MapLocSpclNum
7aca: a2 75                     LDX #$75             ;     Set
7acc: a0 00                     LDY #$00             ;         Y/X = $7500 [EncntrDefeated]
7ace: 38                        SEC                  ;     Set C = 1
7acf: 20 60 18                  JSR j_updateBit      ;     Call $1860 [j_updateBit]
                                                     ; End If
7ad2: 20 34 97  loc_7ad2        JSR sub_9734         ; Call $9734 [sub_9734]
7ad5: 20 67 90                  JSR clrSmthngHere    ; Call $9067 [clrSmthngHere]
7ad8: a9 ff                     LDA #$ff             ; Set
7ada: 8d 59 19                  STA MapLocSpclType   ;     MapLocSpclType = $ff
7add: a0 00                     LDY #$00             ; Set Y = 0
7adf: b1 68                     LDA (FoeWpnAddr_L),Y ; If
7ae1: c9 03                     CMP #$03             ;    ((*FoeWpnAddr_L)[0] == 3)
7ae3: d0 39                     BNE loc_7b1e         ; Then
7ae5: ce 7b 19                  DEC ForceGetFlg      ;     Subtract 1 from ForceGetFlg
7ae8: a5 68                     LDA FoeWpnAddr_L     ;     Set
7aea: 85 07                     STA SourceAdr_L      ;         SourceAdr_L/H
7aec: a5 69                     LDA FoeWpnAddr_H     ;         to
7aee: 85 08                     STA SourceAdr_H      ;         FoeWpnAddr_L/H
7af0: a0 05                     LDY #$05             ;     Set Y = 5
7af2: b1 07                     LDA (SourceAdr_L),Y  ;     Set
7af4: 18                        CLC                  ;         SourceAdr_L
7af5: 65 07                     ADC SourceAdr_L      ;            =
7af7: 85 07                     STA SourceAdr_L      ;              SourceAdr_L + (*SourceAdr_L)[5]
7af9: 90 02                     BCC loc_7afd         ;     If (C == 1) Then
7afb: e6 08                     INC SourceAdr_H      ;         Add 1 to SourceAdr_H
                                                     ;     End If
7afd: a0 0f     loc_7afd        LDY #$0f             ;     Set Y = $f (15)
7aff: b1 07                     LDA (SourceAdr_L),Y  ;     Set A = (*SourceAdr_L)[15]
7b01: c9 ff                     CMP #$ff             ;     If (A != $ff)
7b03: f0 0b                     BEQ loc_7b10         ;     Then
7b05: 20 99 18                  JSR j_randInRange    ;         Call $1899 [j_randInRange] (in A, out A)
7b08: d1 07                     CMP (SourceAdr_L),Y  ;         If (A < (*SourceAdr_L)[15])
7b0a: b0 02                     BCS loc_7b0e         ;         Then
7b0c: 69 01                     ADC #$01             ;             Set A = A + 2
                                                     ;         End If
7b0e: 91 07     loc_7b0e        STA (SourceAdr_L),Y  ;         Set (*SourceAdr_L)[15] = A
                                                     ;     End If
7b10: a6 69     loc_7b10        LDX FoeWpnAddr_H     ;     Set
7b12: a4 68                     LDY FoeWpnAddr_L     ;         Y/X = FoeWpnAddr_L/H
7b14: 20 84 18                  JSR j_addItem        ;     Call $1884 [j_addItem]
7b17: 30 05     sub_7b17        BMI loc_7b1e         ;     If (N == 0) Then
7b19: 85 4b                     STA ItemIndex        ;         Set A = ItemIndex
7b1b: 20 81 90                  JSR sub_9081         ;         Call $9081 [sub_9081]
                                                     ;     End If
                                                     ; End If
7b1e: 20 72 92  loc_7b1e        JSR unlkDroppdItms   ; Call $9272 [unlkDroppdItms]
7b21: a9 0b                     LDA #$0b             ; Set
7b23: 85 96                     STA dat_0096         ;     dat_0096 = $0b (12 iterations [11..0])
7b25: a6 96     loc_7b25        LDX dat_0096         ; Loop
                                                     ;     Set X = dat_0096
7b27: a9 00                     LDA #$00             ;     Set
7b29: 85 02                     STA UInt16Val_L      ;         UInt16Val_L = 0
7b2b: bd 2b aa                  LDA FoeMaxProvsion,X ;     If (FoeMaxProvsion[X] != 0)
7b2e: f0 08                     BEQ loc_7b38         ;     Then
7b30: 85 03                     STA UInt16Val_H      ;         Set UInt16Val_H = FoeMaxProvsion[X]
7b32: 20 ab 18                  JSR j_sub_5bb8       ;         Call $188b [j_sub_5bb8]
7b35: ce 7b 19                  DEC ForceGetFlg      ;         Subtract 1 from ForceGetFlg
                                                     ;     End If
7b38: c6 96     loc_7b38        DEC dat_0096         ;     Subtract 1 from dat_0096
7b3a: 10 e9                     BPL loc_7b25         ; Repeat while (dat_0096 >= 0)
7b3c: 20 2b 85                  JSR sub_852b         ; Call $852b [sub_852b]
7b3f: 4c 6d 77                  JMP cont_776d        ; Continue @ $776d [cont_776d]

                ;
                ;
                ;
7b42: a9 00     contPlayerDied  LDA #$00             ; Set
7b44: 8d 45 63                  STA ChrHp_H          ;     ChrHp_H = 0
7b47: a9 00                     LDA #$00             ; Set
7b49: 8d 46 63                  STA ChrHp_L          ;     ChrHp_L = 0
7b4c: a9 00                     LDA #$00             ; Set
7b4e: 8d 47 63                  STA ChrMaxHp_H       ;     ChrMaxHp_H = 0
7b51: a9 00                     LDA #$00             ; Set
7b53: 8d 48 63                  STA ChrMaxHp_L       ;     ChrMaxHp_L = 0
7b56: 4c 6d 77                  JMP cont_776d        ; Continue @ $776d [cont_776d]

                ;
                ;
                ;
7b59: 20 0e 95  sub_7b59        JSR sub_950e         ; Call $950e [sub_950e]
7b5c: 20 78 7c                  JSR doFoeInit        ; Call $7c78 [doFoeInit]
7b5f: a9 ff                     LDA #$ff             ; Set
7b61: 8d 20 63                  STA dat_6320         ;     dat_6320 = $ff
7b64: 20 50 95                  JSR sub_9550         ; Call $9550 [sub_9550]
7b67: a0 00                     LDY #$00             ; Set Y = 0
7b69: ad 0c aa                  LDA FoeAlign         ; If (FoeAlign < 0)
7b6c: 10 06                     BPL loc_7b74         ; Then
7b6e: c8                        INY                  ;     Add 1 to Y
7b6f: c9 80                     CMP #$80             ;     If (FoeAlign != $80) Then
7b71: f0 01                     BEQ loc_7b74         ;         Add 1 to Y
7b73: c8                        INY                  ;     End If
                                                     ; End If
7b74: be 8f a8  loc_7b74        LDX tbl_a88f,Y       ; Set X = tbl_a88f[Y]
7b77: 20 26 98                  JSR sub_9826         ; Call $9826 [sub_9826]
7b7a: a2 00                     LDX #$00             ; Set X = 0                         (Select foe's weapon)
7b7c: ad 0a d2                  LDA RANDOM           ; Set A = random byte
7b7f: c9 b0                     CMP #$b0             ; If (A >= $b0 (176))               ((256-176)/256 = 31.25% chance)
7b81: 90 06                     BCC loc_7b89         ; Then
7b83: e8                        INX                  ;     Add 1 to X
7b84: c9 f8                     CMP #$f8             ;     If (A >= $f8 (248)) Then      ((256-248)/256 = 3.125% chance)
7b86: 90 01                     BCC loc_7b89         ;         Add 1 to X
7b88: e8                        INX                  ;     End If
                                                     ; End If
7b89: 8a        loc_7b89        TXA                  ; Set A = X    (X = 0..2)
7b8a: 20 89 92                  JSR setFoeWeapon     ; Call $9289 [setFoeWeapon]   (in A)
7b8d: 18                        CLC                  ; Set
7b8e: ad 1d 63                  LDA ChrDungeonLevel  ;     A
7b91: 6d 00 aa                  ADC FoeCount         ;       =
7b94: 0a                        ASL                  ;         (
7b95: 0a                        ASL                  ;           (ChrDungeonLevel + FoeCount) * 8
7b96: 0a                        ASL                  ;         )
7b97: 69 18                     ADC #$18             ;         + $18 (24)
7b99: 8d a0 a8                  STA dat_a8a0         ; Set dat_a8a0 = A
7b9c: a2 0b                     LDX #$0b             ; Set X = $0b (11)
7b9e: ad 0a d2  loc_7b9e        LDA RANDOM           ; Loop
                                                     ;     Set A = random byte
7ba1: cd a0 a8                  CMP dat_a8a0         ;     If (A >= dat_a8a0)
7ba4: 90 04                     BCC loc_7baa         ;     Then
7ba6: a9 00                     LDA #$00             ;         Set A = 0
7ba8: f0 06                     BEQ loc_7bb0         ;     Else
7baa: bd 2b aa  loc_7baa        LDA FoeMaxProvsion,X ;         Set A = FoeMaxProvsion[X]
7bad: 20 99 18                  JSR j_randInRange    ;         Call $1899 [j_randInRange] (in A, out A)
                                                     ;     End If
7bb0: 9d 2b aa  loc_7bb0        STA FoeMaxProvsion,X ;     Set FoeMaxProvsion[X] = A
7bb3: ca                        DEX                  ;     Subtract 1 from X
7bb4: 10 e8                     BPL loc_7b9e         ; Repeat while (X >= 0)
7bb6: ad 85 63                  LDA ChrAlign         ; Set
7bb9: 0a                        ASL                  ;     A = ChrAlign * 2                              (C = old bit 7)
7bba: ad 0c aa                  LDA FoeAlign         ; Set
7bbd: 6a                        ROR                  ;     dat_00ad
7bbe: 29 c0                     AND #$c0             ;       =
7bc0: 85 ad                     STA dat_00ad         ;         ((FoeAlign / 2) | (C << 7)) & $c0 (1100_0000)
7bc2: ad 0c aa                  LDA FoeAlign         ; If                                   (alignment check)
7bc5: 4d 85 63                  EOR ChrAlign         ;   ((FoeAlign ^ ChrAlign) < 0)        (either bit 7 set, not both)
7bc8: 10 08                     BPL loc_7bd2         ; Then
7bca: ad 21 aa                  LDA Foe_aa21         ;     Set Foe_aa21
7bcd: 09 80                     ORA #$80             ;            =
7bcf: 8d 21 aa                  STA Foe_aa21         ;              Foe_aa21 | $80
                                                     ; End If
7bd2: a2 00     loc_7bd2        LDX #$00             ; Set X = 0
7bd4: ac 00 aa                  LDY FoeCount         ; Set Y = FoeCount
7bd7: 84 8a                     STY dat_008a         ; Set dat_008a = Y
7bd9: ad 22 aa  loc_7bd9        LDA FoeHp_H          ; Loop
7bdc: 95 b2                     STA FoeHpTbl_H,X     ;     Set FoeHpTbl_H/L[X]
7bde: ad 23 aa                  LDA FoeHp_L          ;         to
7be1: 95 b3                     STA FoeHpTbl_L,X     ;         FoeHp_H/L
7be3: e8                        INX                  ;     Subtract
7be4: e8                        INX                  ;              2 from X
7be5: 88                        DEY                  ;     Subtract 1 from Y
7be6: d0 f1                     BNE loc_7bd9         ; Repeat while (Y != 0)
7be8: a9 29                     LDA #$29             ; Set
7bea: 85 16                     STA StrTmplate_L     ;     StrTmplate_L/H
7bec: a9 a0                     LDA #$a0             ;     to
7bee: 85 17                     STA StrTmplate_H     ;     $a029 [StrYouEncnter]
7bf0: 20 12 18                  JSR j_printTop       ; Call $1812 [j_printTop]
7bf3: a5 a6                     LDA FactionNum       ; If
7bf5: c9 0e                     CMP #$0e             ;    (FactionNum < $e (14))
7bf7: b0 7e                     BCS loc_7c77         ; Then
7bf9: a9 df                     LDA #$df             ;     Set
7bfb: 8d db 76                  STA GenderZts_L      ;         GenderZts_L/H
7bfe: a9 76                     LDA #$76             ;         to
7c00: 8d dc 76                  STA GenderZts_H      ;         $76df [ZtsBlank]
7c03: a2 a6                     LDX #$a6             ;     Set
7c05: a0 25                     LDY #$25             ;         Y/X = $a625 [StrYouEncnter2]
7c07: 20 ef 8e                  JSR dsplyTmpltStr    ;     Call $8eef [dsplyTmpltStr] (in Y/X)
7c0a: a6 a6                     LDX FactionNum       ;     If (
7c0c: bd c2 63                  LDA FactionRepute,X  ;           (FactionRepute[FactionNum] & $40) == 0      (not enemy)
7c0f: 29 40                     AND #$40             ;        )
7c11: d0 09                     BNE loc_7c1c         ;     Then
7c13: bd c2 63                  LDA FactionRepute,X  ;         If ((FactionRepute[FactionNum] & $8f) != 0) Then
7c16: 29 8f                     AND #$8f             ;             Continue @ $7c29 [loc_7c29]   (member or rep)
7c18: d0 0f                     BNE loc_7c29         ;         Else
7c1a: f0 31                     BEQ loc_7c4d         ;             Continue @ $7c4d [loc_7c4d]   (not member/no rep)
                                                     ;         End If
                                                     ;     End If
7c1c: a9 79     loc_7c1c        LDA #$79             ;     Set                              (enemy)
7c1e: 8d db 76                  STA GenderZts_L      ;         GenderZts_L/H
7c21: a9 a6                     LDA #$a6             ;         to
7c23: 8d dc 76                  STA GenderZts_H      ;         $a679 [ZtsDieOutcast]
7c26: 4c 63 7c                  JMP loc_7c63         ;     Continue @ $7c63 [loc_7c63]
7c29: ad 21 aa  loc_7c29        LDA Foe_aa21         ;     Set
7c2c: 29 5f                     AND #$5f             ;         Foe_aa21
7c2e: 09 40                     ORA #$40             ;            =                             (Clear bit 5, set bit 6)
7c30: 8d 21 aa                  STA Foe_aa21         ;              (Foe_aa21 & 0101_1111) | $40
7c33: a9 89                     LDA #$89             ;     Set
7c35: 8d db 76                  STA GenderZts_L      ;         GenderZts_L/H
7c38: a9 a6                     LDA #$a6             ;         to
7c3a: 8d dc 76                  STA GenderZts_H      ;         $a689 [ZtsHailFriend]
7c3d: ad 17 aa                  LDA dat_aa17_L       ;     If
7c40: 0d 18 aa                  ORA dat_aa17_H       ;        ((dat_aa17_L | dat_aa17_H) == 0)
7c43: d0 05                     BNE loc_7c4a         ;     Then
7c45: a9 05                     LDA #$05             ;         Set
7c47: 8d 17 aa                  STA dat_aa17_L       ;             dat_aa17_L = 5
7c4a: 4c 6d 7c  loc_7c4a        JMP loc_7c6d         ;     Else
7c4d: a5 a6     loc_7c4d        LDA FactionNum       ;         Set X
7c4f: 49 01                     EOR #$01             ;               =
7c51: aa                        TAX                  ;                 FactionNum ^ 1        (perhaps opposing faction?)
7c52: bd c2 63                  LDA FactionRepute,X  ;         If
7c55: 29 8f                     AND #$8f             ;            ((FactionRepute[X] & $8f != 0)  (member or has repute)
7c57: f0 14                     BEQ loc_7c6d         ;         Then
7c59: a9 98                     LDA #$98             ;             Set
7c5b: 8d db 76                  STA GenderZts_L      ;                 GenderZts_L/H
7c5e: a9 a6                     LDA #$a6             ;                 to
7c60: 8d dc 76                  STA GenderZts_H      ;                 $a698 [ZtsBegoneOffl]
7c63: ad 21 aa  loc_7c63        LDA Foe_aa21         ;             Set
7c66: 29 bf                     AND #$bf             ;                 Foe_aa21             (Clear bit 6 ($40),
7c68: 09 a0                     ORA #$a0             ;                    =                  Set bits 5 ($20) & 7 ($80))
7c6a: 8d 21 aa                  STA Foe_aa21         ;                    (Foe_aa21 & 1011_1111 ($bf)) | 1010_0000 ($a0)
                                                     ;         End If
                                                     ;     End If
7c6d: 20 58 93  loc_7c6d        JSR waitHalfSec      ;     Call $9358 [waitHalfSec]
7c70: a2 a6                     LDX #$a6             ;     Set
7c72: a0 25                     LDY #$25             ;         Y/X = $a625 [StrYouEncnter2]
7c74: 20 d1 8e                  JSR dsplyMsg4Secs    ;     Call $8ed1 [dsplyMsg4Secs]   (in Y/X)
                                                     ; End If
7c77: 60        loc_7c77        RTS                  ; Return to caller

                ; Executes the foe's initialization code.
                ;
                ; Input
                ;   FoeInit_L - A predefined action index when FoeInit_H == 0 or an address LSB with the MSB
                ;               in FoeInit_H.
                ;                   0: $7c9e [cont_7c9e]      5: $7d4b [cont_7d4b]
                ;                   1: $7c9e [cont_7c9e]      6: $7d53 [cont_7d53]
                ;                   2: $7d38 [cont_7d38]      7: $7d82 [cont_7d82]
                ;                   3: $7c9e [cont_7c9e]      8: $7c9e [cont_7c9e]
                ;                   4: $7c9e [cont_7c9e]
                ;   FoeInit_H - When non-0, then the subroutine at the address specified by FoeInit_L/H will be
                ;               executed.
                ;
7c78: ae 11 aa  doFoeInit       LDX FoeInit_L        ; Set X = FoeInit_L
7c7b: ad 12 aa                  LDA FoeInit_H        ; Set A = FoeInit_H
7c7e: f0 03                     BEQ loc_7c83         ; If (A != 0) Then
7c80: 4c e7 94                  JMP contAtAddrXA     ;     Continue @ $94e7 [contAtAddrXA] (in X/A)
                                                     ; End If
7c83: bd 95 7c  loc_7c83        LDA FoeInitCont_H,X  ; Push FoeInitCont_H[X]
7c86: 48                        PHA                  ;    to the stack
7c87: bd 8c 7c                  LDA FoeInitCont_L,X  ; Push FoeInitCont_L[X]
7c8a: 48                        PHA                  ;    to the stack
7c8b: 60                        RTS                  ; Indirectly invoke the address on the stack + 1

7c8c: 9d 9d 37  FoeInitCont_L   .BYTE $9d,$9d,$37              ; 9 bytes: LSBs of continuation addresses of standard
7c8f: 9d 9d 4a 52 81 9d         .BYTE $9d,$9d,$4a,$52,$81,$9d  ;          foe initialization routines

7c95: 7c 7c 7d  FoeInitCont_H   .BYTE $7c,$7c,$7d              ; 9 bytes: MSBs of continuation addresses of standard
7c98: 7c 7c 7d 7d 7d 7c         .BYTE $7c,$7c,$7d,$7d,$7d,$7c  ;          foe initialization routines
                                                               ;     0: $7c9e [cont_7c9e]      5: $7d4b [cont_7d4b]
                                                               ;     1: $7c9e [cont_7c9e]      6: $7d53 [cont_7d53]
                                                               ;     2: $7d38 [cont_7d38]      7: $7d82 [cont_7d82]
                                                               ;     3: $7c9e [cont_7c9e]      8: $7c9e [cont_7c9e]
                                                               ;     4: $7c9e [cont_7c9e]

                ;
                ; - Determines the number of foes which are encountered based on the player's experience level and
                ;   current map/dungeon level.
                ; - Computes random level adjustment my adding min(FoeLevelAdj, random between 0 and ChrExpLevel/2)
                ;   to the foe's level.
                ;
                ; Input
                ;   dat_6320   -
                ;
                ; Temp
                ;   dat_0096   -
                ;
7c9e: ad 20 63  cont_7c9e       LDA dat_6320         ; If (dat_6320 < 0)
7ca1: 10 27                     BPL loc_7cca         ; Then                                   (determine number of foes)
7ca3: ad 3c 63                  LDA ChrExpLevel      ;     Set
7ca6: 4a                        LSR                  ;         dat_0096
7ca7: 4a                        LSR                  ;            =
7ca8: 4a                        LSR                  ;              (ChrExpLevel / 16)
7ca9: 4a                        LSR                  ;                 +
7caa: 85 96                     STA dat_0096         ;                   1
7cac: e6 96                     INC dat_0096         ;
7cae: ae 15 63                  LDX CHR_LOC_MAP      ;     Set X = CHR_LOC_MAP
7cb1: 18                        CLC                  ;     Set A
7cb2: bd 31 7d                  LDA tbl_7d31,X       ;           =
7cb5: 65 96                     ADC dat_0096         ;             tbl_7d31[X] + dat_0096
7cb7: 20 99 18                  JSR j_randInRange    ;     Call $1899 [j_randInRange]  (in A, out A)
7cba: 85 96                     STA dat_0096         ;     Set dat_0096 = A
7cbc: d0 02                     BNE loc_7cc0         ;     If (A == 0) Then
7cbe: e6 96                     INC dat_0096         ;         Add 1 to dat_0096
                                                     ;     End If
7cc0: a5 96     loc_7cc0        LDA dat_0096         ;     If
7cc2: cd 00 aa                  CMP FoeCount         ;        (dat_0096 < FoeCount)
7cc5: b0 03                     BCS loc_7cca         ;     Then
7cc7: 8d 00 aa                  STA FoeCount         ;         Set FoeCount = dat_0096
                                                     ;     End If
                                                     ; End If
7cca: ad 3c 63  loc_7cca        LDA ChrExpLevel      ; Set
7ccd: 4a                        LSR                  ;     A = ChrExpLevel / 2
7cce: 20 99 18                  JSR j_randInRange    ; Call $1899 [j_randInRange]  (in A, out A)
7cd1: cd 0e aa                  CMP FoeLevelAdj      ; If (A < FoeLevelAdj)
7cd4: b0 03                     BCS loc_7cd9         ; Then
7cd6: 8d 0e aa                  STA FoeLevelAdj      ;     Set FoeLevelAdj = A
                                                     ; End If
7cd9: a9 07     loc_7cd9        LDA #$07             ; Set
7cdb: 85 88                     STA DiceSides        ;     DiceSides = 7
7cdd: ad 0e aa                  LDA FoeLevelAdj      ; If (FoeLevelAdj != 0)
7ce0: f0 4e                     BEQ loc_7d30         ; Then
7ce2: 85 87                     STA DiceCount        ;     Set DiceCount = FoeLevelAdj
7ce4: 20 aa 8f                  JSR rollDice         ;     Call $8faa [rollDice]
7ce7: 18                        CLC                  ;     Set
7ce8: a5 7a                     LDA DiceRoll_L       ;         FoeHp_L
7cea: 6d 23 aa                  ADC FoeHp_L          ;            =
7ced: 8d 23 aa                  STA FoeHp_L          ;              FoeHp_L + DiceRoll_L
7cf0: 90 03                     BCC loc_7cf5         ;     If (C == 1) Then
7cf2: ee 22 aa                  INC FoeHp_H          ;         Add 1 to FoeHp_H
                                                     ;     End If
7cf5: a9 06     loc_7cf5        LDA #$06             ;     Set
7cf7: 85 96                     STA dat_0096         ;         dat_0096 = 6     (7 iterations [6..0])
7cf9: a9 0f     loc_7cf9        LDA #$0f             ;     Loop
7cfb: 85 88                     STA DiceSides        ;         Set DiceSides = $f (15)
7cfd: ad 0e aa                  LDA FoeLevelAdj      ;         Set
7d00: 85 87                     STA DiceCount        ;             DiceCount = FoeLevelAdj
7d02: 20 aa 8f                  JSR rollDice         ;         Call $8faa [rollDice]              (C=1 if result clamped
7d05: a6 96                     LDX dat_0096         ;         Set X = dat_0096                           to 255 else 0)
7d07: bd 24 aa                  LDA FoeStats,X       ;         Set A = FoeStats[X]
7d0a: f0 09                     BEQ loc_7d15         ;         If (A != 0) Then
7d0c: 65 7a                     ADC DiceRoll_L       ;             Set A = A + DiceRoll_L + C
7d0e: 90 02                     BCC loc_7d12         ;             If (C == 1) Then
7d10: a9 ff                     LDA #$ff             ;                 Set A = $ff (255)
                                                     ;             End If
7d12: 9d 24 aa  loc_7d12        STA FoeStats,X       ;             Set FoeStats[X] = A
                                                     ;         End If
7d15: c6 96     loc_7d15        DEC dat_0096         ;         Subtract 1 from dat_0096
7d17: 10 e0                     BPL loc_7cf9         ;     Repeat while (dat_0096 >= 0)
7d19: 18                        CLC                  ;     Set
7d1a: ad 0e aa                  LDA FoeLevelAdj      ;         FoeLevel
7d1d: 6d 0d aa                  ADC FoeLevel         ;            =
7d20: 8d 0d aa                  STA FoeLevel         ;              FoeLevel + FoeLevelAdj
7d23: ae 1d 63                  LDX ChrDungeonLevel  ;     Set
7d26: ca                        DEX                  ;         X = ChrDungeonLevel - 1
7d27: f0 07                     BEQ loc_7d30         ;     If (X != 0)                  (0 = Level 1)
7d29: e0 03                     CPX #$03             ;        And (X != 3)              (3 = Level 4)
7d2b: f0 03                     BEQ loc_7d30         ;     Then
7d2d: 20 b5 89                  JSR sub_89b5         ;         Call $89b5 [sub_89b5]
                                                     ;     End If
                                                     ; End If
7d30: 60        loc_7d30        RTS                  ; Return to caller

7d31: 01 00 02  tbl_7d31        .BYTE $01,$00,$02    ;
7d34: 02 03                     .BYTE $02,$03        ;
7d36: 04        loc_7d36        .BYTE $04            ;
7d37: 01                        .BYTE $01            ;

                ;
                ;
                ;
7d38: ad 0a d2  cont_7d38       LDA RANDOM           ; If (random byte < 0) Then                (50% chance)
7d3b: 10 03                     BPL loc_7d40         ;     Continue @ $7d82 [cont_7d82]
7d3d: 4c 82 7d                  JMP cont_7d82        ; End If
7d40: ad 0a d2  loc_7d40        LDA RANDOM           ; If (random byte < 0) Then                (25% chance)
7d43: 10 03                     BPL loc_7d48         ;     Continue @ $7d4b [cont_7d4b]
7d45: 4c 4b 7d                  JMP cont_7d4b        ; End If
7d48: 4c 53 7d  loc_7d48        JMP cont_7d53        ; Contiue @ $7d53 [cont_7d53]              (25% chance)

                ;
                ;
                ;
7d4b: ad 0a d2  cont_7d4b       LDA RANDOM           ; Set
7d4e: 29 7f                     AND #$7f             ;     A = random byte & $7f    (0..127)
7d50: 4c 58 7d                  JMP cont_7d58        ; Continue @ $7d58 [cont_7d58]

                ;
                ;
                ;
7d53: ad 0a d2  cont_7d53       LDA RANDOM           ; Set
7d56: 09 80                     ORA #$80             ;     A = random byte | $80    (128..256 / -1..-128)

                ;
                ;
                ;
7d58: 8d 0c aa  cont_7d58       STA FoeAlign         ; Set FoeAlign = A
7d5b: 20 9e 7c                  JSR cont_7c9e        ; Call $7c9e [cont_7c9e]
7d5e: a9 df                     LDA #$df             ; Set
7d60: 8d db 76                  STA GenderZts_L      ;     GenderZts_L/H
7d63: a9 76                     LDA #$76             ;     to
7d65: 8d dc 76                  STA GenderZts_H      ;     $76df [ZtsBlank]
7d68: ad 0c aa  loc_7d68        LDA FoeAlign         ; Loop
7d6b: 2a                        ROL                  ;     Set dat_0096
7d6c: 2a                        ROL                  ;           =
7d6d: 29 01                     AND #$01             ;             ~((FoeAlign >> 7) & 1)
7d6f: 49 01                     EOR #$01             ;       .
7d71: 85 96                     STA dat_0096         ;       .
7d73: a9 04                     LDA #$04             ;     Set A = 4
7d75: 20 99 18                  JSR j_randInRange    ;     Call $1899 [j_randInRange]  (in A, out A)
7d78: 0a                        ASL                  ;     Set FactionNum
7d79: 05 96                     ORA dat_0096         ;            =
7d7b: 85 a6                     STA FactionNum       ;              (A * 2) | dat_0096
7d7d: c9 05                     CMP #$05             ; Repeat
7d7f: f0 e7                     BEQ loc_7d68         ;    while (FactionNum == 5)           (FactionNum in 0..4 on exit)
7d81: 60                        RTS                  ; Return to caller

                ;
                ;
                ;
7d82: 20 9e 7c  cont_7d82       JSR cont_7c9e        ; Call $7c9e [cont_7c9e]
7d85: a9 00                     LDA #$00             ; Set
7d87: 85 96                     STA dat_0096         ;     dat_0096 = 0
7d89: a2 7f                     LDX #$7f             ; Set X = $7f
7d8b: ad 0c aa                  LDA FoeAlign         ; If (FoeAlign < 0)
7d8e: 10 0b                     BPL loc_7d9b         ; Then
7d90: c9 80                     CMP #$80             ;     If (FoeAlign == $80)
7d92: d0 04                     BNE loc_7d98         ;     Then
7d94: a2 ff                     LDX #$ff             ;         Set X = $ff
7d96: d0 03                     BNE loc_7d9b         ;     Else
7d98: 38        loc_7d98        SEC                  ;         Set C = 1
7d99: 66 96                     ROR dat_0096         ;         Set dat_0096 = (dat_0096 >> 1) | $80
                                                     ;     End If
                                                     ; End If
7d9b: 8a        loc_7d9b        TXA                  ; Set A = X
7d9c: 20 99 18                  JSR j_randInRange    ; Call $1899 [j_randInRange]  (in A, out A)
7d9f: 05 96                     ORA dat_0096         ; Set
7da1: 8d 0c aa                  STA FoeAlign         ;     FoeAlign = A | dat_0096
7da4: 8d 0c aa                  STA FoeAlign         ;  .
7da7: ad 0c aa                  LDA FoeAlign         ;  .
7daa: 10 07                     BPL loc_7db3         ; If (FoeAlign >= 0) Then
7dac: ad 85 63                  LDA ChrAlign         ;     If
7daf: 30 14                     BMI loc_7dc5         ;        (ChrAlign < 0)            (good)
7db1: 10 0a                     BPL loc_7dbd         ;        Or (random byte >= 0)     (or 50% chance)
7db3: ad 85 63  loc_7db3        LDA ChrAlign         ;     Then
7db6: 30 05                     BMI loc_7dbd         ;         Set Foe_aa21 = Foe_aa21 | 1010_0000 ($a0)  (set bits 7&5)
7db8: ad 0a d2                  LDA RANDOM           ;     End If
7dbb: 30 08                     BMI loc_7dc5         ; Else If (ChrAlign >= 0) Then
7dbd: ad 21 aa  loc_7dbd        LDA Foe_aa21         ;     Set Foe_aa21 = Foe_aa21 | 1010_0000 ($a0)      (set bits 7&5)
7dc0: 09 a0                     ORA #$a0             ; End If
7dc2: 8d 21 aa                  STA Foe_aa21         ;
7dc5: 60        loc_7dc5        RTS                  ; Return to caller

                ; Executes the "pre-encounter" code for the foe.
                ;
7dc6: ae 15 aa  doFoePreEncntr  LDX FoePreEncntr_L   ; Set X = FoePreEncntr_L
7dc9: ad 16 aa                  LDA FoePreEncntr_H   ; Set A = FoePreEncntr_H
7dcc: f0 03                     BEQ loc_7dd1         ; If (A != 0) Then
7dce: 4c e7 94                  JMP contAtAddrXA     ;     Continue @ $94e7 [contAtAddrXA] (in X/A)
                                                     ; End If
7dd1: 60        loc_7dd1        RTS                  ; Return to caller

                ;
                ;
                ;
7dd2: a2 9b     sub_7dd2        LDX #$9b             ; Set
7dd4: a0 2a                     LDY #$2a             ;     Y/X = $9b2a [StrYouSurprise]
7dd6: 20 ef 8e                  JSR dsplyTmpltStr    ; Call $8eef [dsplyTmpltStr] (in Y/X)
7dd9: a9 04                     LDA #$04             ; Set A = 4
7ddb: 20 1c 90                  JSR getMenuSel       ; Call $901c [getMenuSel] (in A, out A [0..3])
7dde: c9 03                     CMP #$03             ; If (A == 3)                           (3 = None of these)
7de0: d0 02                     BNE loc_7de4         ; Then
7de2: 18                        CLC                  ;     Set C = 0
7de3: 60                        RTS                  ;     Return to caller
                                                     ; End If
7de4: c9 00     loc_7de4        CMP #$00             ; If (A == 0)                           (0 = Leave)
7de6: d0 09                     BNE loc_7df1         ; Then
7de8: 2c 20 aa                  BIT Foe_aa20         ;     If ((Foe_aa20 & $40) != 0)
7deb: 50 01                     BVC loc_7dee         ;     Then
7ded: 60                        RTS                  ;         Return to caller
                                                     ;     End If
7dee: 4c 9d 84  loc_7dee        JMP cont_849d        ;     Continue @ $849d [cont_849d]
                                                     ; End If
7df1: ad 27 aa  loc_7df1        LDA FoeInt           ; If (FoeInt != 0)
7df4: f0 08                     BEQ loc_7dfe         ;    And (ChrAlign != 0)
7df6: ad 85 63                  LDA ChrAlign         ; Then
7df9: f0 03                     BEQ loc_7dfe         ;     Subtract 1 from ChrAlign
7dfb: ce 85 63                  DEC ChrAlign         ; End If
7dfe: a9 01     loc_7dfe        LDA #$01             ; Set
7e00: 85 96                     STA dat_0096         ;     dat_0096 = 1
7e02: c5 74                     CMP MenuSel          ; If (MenuSel == 1)                    (1 = Waylay)
7e04: d0 1d                     BNE loc_7e23         ; Then
7e06: ad 0a d2                  LDA RANDOM           ;     Set dat_0097
7e09: 29 03                     AND #$03             ;            =
7e0b: 85 97                     STA dat_0097         ;              random byte & 3         (0..3)
7e0d: d0 0a                     BNE loc_7e19         ;     If (dat_0097 == 0) Then          (25% chance)
7e0f: a2 9c                     LDX #$9c             ;         Set
7e11: a0 24                     LDY #$24             ;             Y/X = $9c24 [StrAttemptFail]
7e13: 20 d1 8e                  JSR dsplyMsg4Secs    ;         Call $8ed1 [dsplyMsg4Secs]   (in Y/X)
7e16: 4c 98 7e                  JMP loc_7e98         ;         Continue @ $7e98 [loc_7e98]
                                                     ;     End If
7e19: ad 0a d2  loc_7e19        LDA RANDOM           ;     Set
7e1c: 29 03                     AND #$03             ;         dat_0096
7e1e: 18                        CLC                  ;            =
7e1f: 65 96                     ADC dat_0096         ;              dat_0096
7e21: 85 96                     STA dat_0096         ;                 + (random byte & 3)
                                                     ; End If
7e23: a9 80     loc_7e23        LDA #$80             ; Set
7e25: 85 ab                     STA dat_00ab         ;     dat_00ab = $80
7e27: ad 21 aa                  LDA Foe_aa21         ; Set
7e2a: 29 10                     AND #$10             ;     Foe_aa21
7e2c: 09 a0                     ORA #$a0             ;        =
7e2e: 8d 21 aa                  STA Foe_aa21         ;          (Foe_aa21 & $10) | $a0
7e31: a2 87                     LDX #$87             ; Set X = $87                           ($6387 [CHR_Unk_6387])
7e33: a9 01                     LDA #$01             ; Set A = 1
7e35: 20 78 18                  JSR j_incChrAttr8    ; Call $1878 [j_incChrAttr8]
7e38: 2c 85 63                  BIT ChrAlign         ; If (ChrAlign < 0)
7e3b: 10 03                     BPL loc_7e40         ; Then
7e3d: ce 85 63                  DEC ChrAlign         ;     Subtract 1 from ChrAlign
                                                     ; End If
7e40: a5 96     loc_7e40        LDA dat_0096         ; Loop
7e42: c9 01                     CMP #$01             ;     If (dat_0096 == 1)
7e44: d0 0a                     BNE loc_7e50         ;     Then
7e46: a2 0b                     LDX #$0b             ;         Set X = $b (12 iterations: [11..0])
7e48: bd 2b aa  loc_7e48        LDA FoeMaxProvsion,X ;         Loop
7e4b: d0 14                     BNE loc_7e61         ;             If (FoeMaxProvsion[X] != 0) Then
                                                     ;                 Continue @ $7e61 [loc_7e61]
                                                     ;             End If
7e4d: ca                        DEX                  ;             Subtract 1 from X
7e4e: 10 f8                     BPL loc_7e48         ;         Repeat while (X >= 0)
                                                     ;     End If
                                                     ;     If (X == 0) Then
7e50: a9 0b     loc_7e50        LDA #$0b             ;         Set A = $b (11)
7e52: 20 99 18                  JSR j_randInRange    ;         Call $1899 [j_randInRange]  (in A, out A)
7e55: aa                        TAX                  ;         Set X = A
7e56: bd 2b aa                  LDA FoeMaxProvsion,X ;         If (FoeMaxProvsion[X] == 0)
7e59: d0 06                     BNE loc_7e61         ;         Then
7e5b: a9 0b                     LDA #$0b             ;             Set A = $b (11)
7e5d: 20 99 18                  JSR j_randInRange    ;             Call $1899 [j_randInRange]  (in A, out A)
7e60: aa                        TAX                  ;             Set X = A
                                                     ;         End If
                                                     ;     End If
7e61: 86 94     loc_7e61        STX dat_0094         ;     Set dat_0094 = X
7e63: bd 2b aa                  LDA FoeMaxProvsion,X ;     Set A = FoeMaxProvsion[X]
7e66: d0 07                     BNE loc_7e6f         ;     If (A == 0) Then
7e68: a2 9b                     LDX #$9b             ;         Set
7e6a: a0 b6                     LDY #$b6             ;             Y/X = $9bb6 [StrNthngOfValu]
7e6c: 4c 8a 7e                  JMP loc_7e8a         ;     Else
7e6f: 48        loc_7e6f        PHA                  ;         Push A on stack
7e70: a9 00                     LDA #$00             ;         Set
7e72: 9d 2b aa                  STA FoeMaxProvsion,X ;             FoeMaxProvsion[X] = 0
7e75: bc e0 76                  LDY PrvsnAttrSize,X  ;         Set Y = PrvsnAttrSize[X]
7e78: bd ec 76                  LDA PrvsnAttrOfs,X   ;         Set
7e7b: aa                        TAX                  ;             X = PrvsnAttrOfs[X]
7e7c: 68                        PLA                  ;         Restore A from stack
7e7d: 20 75 18                  JSR j_incChrAttr     ;         Call $1875 [j_incChrAttr]  (in X (ofs), Y (size), A)
7e80: 20 f9 8e                  JSR applyUpdates     ;         Call $8ef9 [applyUpdates]
7e83: 20 a5 7e                  JSR getItemPrvsnNm   ;         Call $7ea5 [getItemPrvsnNm]
7e86: a2 9b                     LDX #$9b             ;         Set
7e88: a0 d1                     LDY #$d1             ;             Y/X = $9bd1 [StrSomeOfThe]
                                                     ;     End If
7e8a: 20 d1 8e  loc_7e8a        JSR dsplyMsg4Secs    ;     Call $8ed1 [dsplyMsg4Secs]   (in Y/X)
7e8d: c6 97                     DEC dat_0097         ;     Subtract 1 from dat_0097
7e8f: f0 07                     BEQ loc_7e98         ;     If (dat_0097 != 0) Then
7e91: c6 96                     DEC dat_0096         ;         Subtract 1 from dat_0096
                                                     ;     End If
7e93: f0 03                     BEQ loc_7e98         ; Repeat
7e95: 4c 40 7e                  JMP loc_7e40         ;    while (dat_0097 != 0) And (dat_0096 != 0)
7e98: a9 00     loc_7e98        LDA #$00             ; Set
7e9a: 85 97                     STA dat_0097         ;     dat_0097 = 0
7e9c: ad 0a d2                  LDA RANDOM           ; Set dat_00c2
7e9f: 29 01                     AND #$01             ;        =
7ea1: 85 c2                     STA dat_00c2         ;          (random byte & 1)
7ea3: 38                        SEC                  ; Set C = 1
7ea4: 60                        RTS                  ; Return to caller

                ; Assigns GrbItemName_L/H to the Zts name of the specified provision type (dat_0094 >= 0) or
                ;     item (dat_0094 < 0).
                ;
                ; Input
                ;   dat_0094  - When positive, this represents a provision item type to retrieve the name for.
                ;               Then negative, the lower 7 bits are an inventory item index of the item to extract the
                ;               name from.
                ;
                ; Output
                ;   GrbItemName_L/H - Assigned the address of the item name ZTS
                ;
7ea5: a5 94     getItemPrvsnNm  LDA dat_0094         ; If (dat_0094 >= 0)
7ea7: 30 0e                     BMI loc_7eb7         ; Then
7ea9: aa                        TAX                  ;     Set X = dat_0094
7eaa: bd f5 98                  LDA PrvsnNames_L,X   ;     Set
7ead: 8d d9 76                  STA GrbItemName_L    ;         GrbItemName_L/H
7eb0: bd 01 99                  LDA PrvsnNames_H,X   ;         to
7eb3: 8d da 76                  STA GrbItemName_H    ;         PrvsnNames_L/H[X]
7eb6: 60                        RTS                  ;     Return to caller
                                                     ; End If
7eb7: 29 7f     loc_7eb7        AND #$7f             ; Set
7eb9: 85 4b                     STA ItemIndex        ;     ItemIndex = dat_0094 & $7f
7ebb: 20 87 18                  JSR j_getItemAdr     ; Call $1887 [j_getItemAdr] (in ItemIndex)
7ebe: 18                        CLC                  ; Set
7ebf: a5 41                     LDA ItemAdr_L        ;     GrbItemName_L
7ec1: 69 06                     ADC #$06             ;        =
7ec3: 8d d9 76                  STA GrbItemName_L    ;          ItemAdr_L + 6                (item name)
7ec6: a5 42                     LDA ItemAdr_H        ; Set GrbItemName_H
7ec8: 69 00                     ADC #$00             ;        =
7eca: 8d da 76                  STA GrbItemName_H    ;          ItemAdr_H + C
7ecd: 60                        RTS                  ; Return to caller

                ;
                ;
                ;
7ece: a9 00     sub_7ece        LDA #$00             ; Set
7ed0: 85 a7                     STA dat_00a7_H       ;     dat_00a7_H = 0
7ed2: 85 a8                     STA dat_00a8_L       ; Set dat_00a8_L = 0
7ed4: 20 f9 8e                  JSR applyUpdates     ; Call $8ef9 [applyUpdates]
7ed7: 20 7e 8d                  JSR sub_8d7e         ; Call $8d7e [sub_8d7e]
7eda: ae 94 a8                  LDX dat_a894         ; Set X = dat_a894
7edd: bd ed 7e                  LDA ContTbl_7ee6_H,X ; Push ContTbl_7ee6_H[X]
7ee0: 48                        PHA                  ;     to the stack
7ee1: bd e6 7e                  LDA ContTbl_7ee6_L,X ; Push ContTbl_7ee6_L[X]
7ee4: 48                        PHA                  ;     to the stack
7ee5: 60                        RTS                  ; Continue @ address on stack + 1

7ee6: f3 4d 50  ContTbl_7ee6_L  .BYTE $f3,$4d,$50      ; 7 bytes: LSBs of continuation addresses
7ee9: 61 7d a9 aa               .BYTE $61,$7d,$a9,$aa  ;

7eed: 7e 7f 7f  ContTbl_7ee6_H  .BYTE $7e,$7f,$7f      ; 7 bytes: MSBs of continuation addresses
7ef0: 7f 7f 7f 7f               .BYTE $7f,$7f,$7f,$7f  ;     0: $7ef4 [cont_7ef4]       4: $7f7e [cont_7f7e]
                                                       ;     1: $7f4e [cont_7f4e]       5: $7faa [contRts_7faa]
                                                       ;     2: $7f51 [cont_7f51]       6: $7fab [cont_7fab]
                                                       ;     3: $7f62 [cont_7f62]

                ;
                ;
                ;
7ef4: a9 fb     cont_7ef4       LDA #$fb             ; Set
7ef6: 85 a1                     STA dat_00a1         ;     dat_00a1 = $fb (251 / 1111_1011)
7ef8: 2c 20 aa                  BIT Foe_aa20         ; If ((Foe_aa20 & $40) == 0)
7efb: 70 34                     BVS loc_7f31         ; Then
7efd: a5 91                     LDA dat_0091         ;     If (dat_0091 == 0)
7eff: d0 2d                     BNE loc_7f2e         ;        And
7f01: a5 ac                     LDA dat_00ac         ;        (dat_00ac != 0)
7f03: f0 29                     BEQ loc_7f2e         ;     Then
7f05: a2 00                     LDX #$00             ;         Set X = 0
7f07: a0 00                     LDY #$00             ;         Set Y = 0
7f09: b5 c2     loc_7f09        LDA dat_00c2,X       ;         Loop
7f0b: 15 c3                     ORA dat_00c3,X       ;             If (dat_00c2[X] | dat_00c3[X] == 0) Then
7f0d: f0 0a                     BEQ loc_7f19         ;                 Exit Loop
                                                     ;             End If
7f0f: e8                        INX                  ;             Set
7f10: e8                        INX                  ;                 X = X + 2
7f11: c8                        INY                  ;             Add 1 to Y
7f12: cc 00 aa                  CPY FoeCount         ;         Repeat
7f15: 90 f2                     BCC loc_7f09         ;            while (Y < FoeCount)
7f17: b0 15                     BCS loc_7f2e         ;         If (Y < FoeCount) Then
7f19: a2 06     loc_7f19        LDX #$06             ;             Set X = 6
7f1b: 24 a5                     BIT dat_00a5         ;             If (dat_00a5 < 0)           (player is knocked down)
7f1d: 10 01                     BPL loc_7f20         ;             Then
7f1f: ca                        DEX                  ;                 Subtract 1 from X
                                                     ;             End If
7f20: ad 79 63  loc_7f20        LDA ChrSpdCalc       ;             If
7f23: cd 2a aa                  CMP FoeSpd           ;                (ChrSpdCalc < FoeSpd)
7f26: b0 01                     BCS loc_7f29         ;             Then
7f28: ca                        DEX                  ;                 Subtract 1 from X
                                                     ;             End If
7f29: 20 0d 8f  loc_7f29        JSR sub_8f0d         ;             Call $8f0d [sub_8f0d] (in A, X)
7f2c: 30 0f                     BMI loc_7f3d         ;             If (N == 1) Then
                                                     ;                 Continue @ $7f3d [loc_7f3d]
                                                     ;             End If
                                                     ;         End If
                                                     ;     End If
7f2e: 4c 68 84  loc_7f2e        JMP cont_8468        ;     Continue @ $8468 [cont_8468]
                                                     ; End If
7f31: a9 33     loc_7f31        LDA #$33             ; Set
7f33: 8d d9 76                  STA GrbItemName_L    ;     GrbItemName_L/H
7f36: a9 a7                     LDA #$a7             ;     to
7f38: 8d da 76                  STA GrbItemName_H    ;     $a733 [ZtsCant]
7f3b: d0 0a                     BNE loc_7f47         ; If (false) Then        (skip over section jumped into from above)
7f3d: a9 2c     loc_7f3d        LDA #$2c             ;     Set
7f3f: 8d d9 76                  STA GrbItemName_L    ;         GrbItemName_L/H
7f42: a9 a7                     LDA #$a7             ;         to
7f44: 8d da 76                  STA GrbItemName_H    ;         $a72c [ZtsDidnt]
                                                     ; End If
7f47: a2 a7     loc_7f47        LDX #$a7             ; Set
7f49: a0 16                     LDY #$16             ;     Y/X = $a716 [StrNotEscape]
7f4b: 4c d1 8e                  JMP dsplyMsg4Secs    ; Continue @ $8ed1 [dsplyMsg4Secs]   (in Y/X)

                ;
                ;
                ;
7f4e: 4c 60 81  cont_7f4e       JMP cont_8160        ; Continue @ $8160 [cont_8160]

                ;
                ;
                ; Continues @ $8160 [cont_8160]
                ;
                ; Input
                ;   dat_0064_L/H -
                ;
                ; Output
                ;   dat_00a1  - decreased by 2
                ;   dat_00a0  - increased by 2 if dat_0064_L[17] is less than 0
                ;
7f51: c6 a1     cont_7f51       DEC dat_00a1         ; Set dat_00a1
7f53: c6 a1                     DEC dat_00a1         ;        = dat_00a1 - 2
7f55: a0 11                     LDY #$11             ; Set Y = $11 (17)
7f57: b1 64                     LDA (dat_0064_L),Y   ; If ((*dat_0064_L)[Y] < 0)
7f59: 10 04                     BPL loc_7f5f         ; Then
7f5b: e6 a0                     INC dat_00a0         ;     Set dat_00a0
7f5d: e6 a0                     INC dat_00a0         ;            = dat_00a0 + 2
                                                     ; End If
7f5f: 4c 60 81  loc_7f5f        JMP cont_8160        ; Continue @ $8160 [cont_8160]

                ;
                ;
                ;
7f62: 20 8d 94  cont_7f62       JSR sub_948d         ; Call $948d [sub_948d]
7f65: e6 a1                     INC dat_00a1         ; Add 1 to dat_00a1
7f67: e6 a0                     INC dat_00a0         ; Set
7f69: e6 a0                     INC dat_00a0         ;     dat_00a0 = dat_00a0 + 2
7f6b: e6 9b                     INC dat_009b         ; Add 1 to dat_009b
7f6d: ad 0a d2                  LDA RANDOM           ; if
7f70: 29 03                     AND #$03             ;    ((random byte & 3) != 0)
7f72: f0 03                     BEQ loc_7f77         ; Then
7f74: 4c 60 81                  JMP cont_8160        ;     Continue @ $8160 [cont_8160]   (75% chance)
                                                     ; End If
7f77: a2 9c     loc_7f77        LDX #$9c             ; Set                                (25% chance)
7f79: a0 dc                     LDY #$dc             ;     Y/X = $9cdc [StrWt4Opening]
7f7b: 4c d1 8e                  JMP dsplyMsg4Secs    ; Continue @ $8ed1 [dsplyMsg4Secs]   (in Y/X)

                ;
                ;
                ;
7f7e: a9 00     cont_7f7e       LDA #$00             ; Set
7f80: 85 97                     STA dat_0097         ;     dat_0097 = 0
7f82: 85 c2                     STA dat_00c2         ; Set dat_00c2 = 0
7f84: c6 a1                     DEC dat_00a1         ; Subtract 1 from dat_00a1
7f86: ad 21 aa                  LDA Foe_aa21         ; If
7f89: 29 20                     AND #$20             ;    (Foe_aa21 & $20 == 0)
7f8b: d0 16                     BNE loc_7fa3         ; Then
7f8d: 2c 21 aa                  BIT Foe_aa21         ;     If (Foe_aa21 & $40 == 0)
7f90: 70 0e                     BVS loc_7fa0         ;        Or (
7f92: 10 07                     BPL loc_7f9b         ;           (Foe_aa21 & $80 != 0)
7f94: ad 0a d2                  LDA RANDOM           ;           And
7f97: c9 30                     CMP #$30             ;           (random byte < $30 (48))    (18.75% chance)
7f99: b0 08                     BCS loc_7fa3         ;           And (random byte >= 0)      (50% chance: overall 9.38%)
7f9b: ad 0a d2  loc_7f9b        LDA RANDOM           ;        )
7f9e: 30 03                     BMI loc_7fa3         ;     Then
7fa0: 4c bf 8a  loc_7fa0        JMP cont_8abf        ;         Continue @ $8abf [cont_8abf]
                                                     ;     End If
                                                     ; End If
7fa3: a2 a7     loc_7fa3        LDX #$a7             ; Set
7fa5: a0 39                     LDY #$39             ;     Y/X = $a739 [StrNotIntrstd]
7fa7: 4c d1 8e                  JMP dsplyMsg4Secs    ; Continue @ $8ed1 [dsplyMsg4Secs]   (in Y/X)

                ; Returns to caller
                ;
7faa: 60        contRts_7faa    RTS                  ; Return to caller

                ;
                ;
                ;
7fab: 20 f9 8e  cont_7fab       JSR applyUpdates     ; Call $8ef9 [applyUpdates]
7fae: c6 a1                     DEC dat_00a1         ; Subtract 1 from dat_00a1
7fb0: 20 61 80                  JSR sub_8061         ; Call $8061 [sub_8061]
7fb3: a2 0a                     LDX #$0a             ; Set X = 10   (11 iterations [10..0])
7fb5: bd dd 63  loc_7fb5        LDA Chr_BluntDmg,X   ; Loop
                                                     ;     Set A = Chr_BluntDmg[X]
7fb8: 20 8e 8f                  JSR rollDiceA        ;     Call $8f8e [rollDiceA] (in A; out A; X, Y unchanged)
7fbb: 9d dd 63                  STA Chr_BluntDmg,X   ;     Set Chr_BluntDmg[X] = A
7fbe: ca                        DEX                  ;     Subtract 1 from X
7fbf: 10 f4                     BPL loc_7fb5         ; Repeat while (X >= 0)
7fc1: 20 bc 83                  JSR sub_83bc         ; Call $83bc [sub_83bc]
7fc4: 20 00 84                  JSR sub_8400         ; Call $8400 [sub_8400]
7fc7: 20 8f 8e                  JSR sub_8e8f         ; Call $8e8f [sub_8e8f]
7fca: ad 20 aa                  LDA Foe_aa20         ; If
7fcd: 29 20                     AND #$20             ;    (Foe_aa20 & $20 == 0)
7fcf: d0 06                     BNE loc_7fd7         ;    Or
7fd1: a5 a7                     LDA dat_00a7_H       ;    ((dat_00a7_H | dat_00a8_L) == 0)
7fd3: 05 a8                     ORA dat_00a8_L       ;
7fd5: d0 03                     BNE loc_7fda         ; Then
7fd7: 4c 60 80  loc_7fd7        JMP contRts_8060     ;     Continue @ $8060 [contRts_8060]
                                                     ; End If
7fda: a2 9f     loc_7fda        LDX #$9f             ; Set
7fdc: a0 ad                     LDY #$ad             ;     Y/X = $9fad [StrPointsOfDmg]
7fde: 20 d1 8e                  JSR dsplyMsg4Secs    ; Call $8ed1 [dsplyMsg4Secs]   (in Y/X)
7fe1: a2 98                     LDX #$98             ; Set
7fe3: a0 81                     LDY #$81             ;     Y/X = $9881 [StrClearRows]
7fe5: 20 ef 8e                  JSR dsplyTmpltStr    ; Call $8ed1 [dsplyMsg4Secs]   (in Y/X)
7fe8: a2 02                     LDX #$02             ; Set X = 2   (3 iterations [2..0])
7fea: bd 79 a1  loc_7fea        LDA ZtsThe2,X        ; Loop
7fed: 9d 6a a1                  STA StrItSpllEffct+4,X ;   StrItSpllEffct[X + 4] = ZtsThe2[X]
7ff0: ca                        DEX                  ;     Subtract 1 from X
7ff1: 10 f7                     BPL loc_7fea         ; Repeat while (X >= 0)
7ff3: a9 01                     LDA #$01             ; Set
7ff5: 85 8b                     STA dat_008b         ;     dat_008b = 1
7ff7: ad e8 63                  LDA Chr_MagicalDmg   ; If
7ffa: f0 14                     BEQ loc_8010         ;    (Chr_MagicalDmg != 0)
7ffc: ac 00 aa                  LDY FoeCount         ;    And
7fff: c0 01                     CPY #$01             ;    (FoeCount != 1)
8001: f0 0d                     BEQ loc_8010         ; Then
8003: 84 8b                     STY dat_008b         ;     Set Y = dat_008b                    (unnecessary assignment?)
8005: a2 02                     LDX #$02             ;     Set X = 2  (3 iterations [2..0])
8007: bd 7d a1  loc_8007        LDA ZtsOne,X         ;     Loop
800a: 9d 6a a1                  STA StrItSpllEffct+4,X ;       Set StrItSpllEffct[X + 4] = ZtsOne[X]
800d: ca                        DEX                  ;         Subtract 1 from X
800e: 10 f7                     BPL loc_8007         ;     Repeat while (X >= 0)
                                                     ; End If
8010: a9 00     loc_8010        LDA #$00             ; Set
8012: 85 8c                     STA dat_008c         ;     dat_008c = 0
8014: 20 0e 81  loc_8014        JSR sub_810e         ; Loop
                                                     ;     Call $810e [sub_810e]
8017: a5 a7                     LDA dat_00a7_H       ;     Set
8019: 85 02                     STA UInt16Val_L      ;         UInt16Val_L = dat_00a7_H
801b: a5 a8                     LDA dat_00a8_L       ;     Set
801d: 85 03                     STA UInt16Val_H      ;         UInt16Val_H = dat_00a8_L
801f: a5 78                     LDA dat_0078         ;     If (dat_0078 >= 0)
8021: 30 0a                     BMI loc_802d         ;     Then
8023: d0 04                     BNE loc_8029         ;         If (dat_0078 == 0) Then
8025: 46 02                     LSR UInt16Val_L      ;             Set UInt16Val_L = UInt16Val_L >> 1    (C = old bit 0)
8027: 66 03                     ROR UInt16Val_H      ;             Set UInt16Val_H = (UInt16Val_H >> 1) | (C << 7)
                                                     ;         End If
8029: 46 02     loc_8029        LSR UInt16Val_L      ;         Set UInt16Val_L = UInt16Val_L >> 1        (C = old bit 0)
802b: 66 03                     ROR UInt16Val_H      ;         Set UInt16Val_H = (UInt16Val_H >> 1) | (C << 7)
                                                     ;     End If
802d: a5 02     loc_802d        LDA UInt16Val_L      ;     If
802f: 05 03                     ORA UInt16Val_H      ;        (UInt16Val_L | UInt16Val_H != 0)
8031: f0 1d                     BEQ loc_8050         ;     Then
8033: a6 8c                     LDX dat_008c         ;         Set X = dat_008c
8035: b5 c3                     LDA dat_00c3,X       ;         Set dat_00c3[X]
8037: 29 7f                     AND #$7f             ;                =
8039: 95 c3                     STA dat_00c3,X       ;                  dat_00c3[X] & $7f
803b: 38                        SEC                  ;         Set
803c: b5 b3                     LDA FoeHpTbl_L,X     ;             FoeHpTbl_L[X]
803e: e5 03                     SBC UInt16Val_H      ;                =                        (C=0 on underflow else 1)
8040: 95 b3                     STA FoeHpTbl_L,X     ;                  FoeHpTbl_L[X] - UInt16Val_H
8042: b5 b2                     LDA FoeHpTbl_H,X     ;         Set FoeHpTbl_H[X]
8044: e5 02                     SBC UInt16Val_L      ;                =
8046: 95 b2                     STA FoeHpTbl_H,X     ;                  FoeHpTbl_H[X] - UInt16Val_L - ~C
8048: b0 06                     BCS loc_8050         ;         If (C == 0) Then   (underflow)
804a: a9 00                     LDA #$00             ;             Set
804c: 95 b2                     STA FoeHpTbl_H,X     ;                 FoeHpTbl_H[X] = 0
804e: 95 b3                     STA FoeHpTbl_L,X     ;             Set FoeHpTbl_L[X] = 0
                                                     ;         End If
                                                     ;     End If
8050: e6 8c     loc_8050        INC dat_008c         ;     Set
8052: e6 8c                     INC dat_008c         ;         dat_008c = dat_008c + 2
8054: c6 8b                     DEC dat_008b         ;     Subtract 1 from dat_008b
8056: f0 03                     BEQ loc_805b         ; Repeat
8058: 4c 14 80                  JMP loc_8014         ;    while (dat_008b != 0)
805b: a9 02     loc_805b        LDA #$02             ; Set A = 2
805d: 20 5a 18                  JSR j_waitSeconds    ; Call $185a [j_waitSeconds]  (in A = 2 seconds)
8060: 60        contRts_8060    RTS                  ; Return to caller

                ;
                ;
                ;
8061: ad f0 63  sub_8061        LDA dat_63f0_OppParalysis ; If (dat_63f0_OppParalysis != 0)
8064: f0 1a                     BEQ loc_8080         ;    And
8066: c9 0a                     CMP #$0a             ;    (dat_63f0_OppParalysis < 10)
8068: b0 16                     BCS loc_8080         ; Then
806a: aa                        TAX                  ;     Set
806b: ca                        DEX                  ;         X = dat_63f0_OppParalysis - 1
806c: bd 8a 80                  LDA ContTbl_8081_H,X ;     Push ContTbl_8081_H[X]
806f: 48                        PHA                  ;        onto the stack
8070: bd 81 80                  LDA ContTbl_8081_L,X ;     Push ContTbl_8081_L[X]
8073: 48                        PHA                  ;        onto the stack
8074: a2 98                     LDX #$98             ;     Set
8076: a0 81                     LDY #$81             ;         Y/X = $9881 [StrClearRows]
8078: 20 ef 8e                  JSR dsplyTmpltStr    ;     Call $8eef [dsplyTmpltStr] (in Y/X)
807b: a9 00                     LDA #$00             ;     Set
807d: 8d f0 63                  STA dat_63f0_OppParalysis ;    dat_63f0_OppParalysis = 0
                                                     ; End If
8080: 60        loc_8080        RTS                  ; Return to caller      (NOTE: If an address was pushed on the
                                                                                    stack above, this will continue at
                                                                                    that location. Otherwise, it will
                                                                                    return to the original caller.)

8081: 92 9f b6  ContTbl_8081_L  .BYTE $92,$9f,$b6              ; 9 bytes: LSBs of continuation addresses
8084: db d7 db 24 3a 40         .BYTE $db,$d7,$db,$24,$3a,$40  ;

808a: 80 80 80  ContTbl_8081_H  .BYTE $80,$80,$80              ; 9 bytes: MSBs of continuation addresses
808d: 80 80 80 81 81 81         .BYTE $80,$80,$80,$81,$81,$81  ;    0: $8093 [cont_8093]    5: $80dc [cont_80dc]
                                                               ;    1: $80a0 [cont_80a0]    6: $8125 [cont_8125]
                                                               ;    2: $80b7 [cont_80b7]    7: $813b [cont_813b]
                                                               ;    3: $80dc [cont_80dc]    8: $8141 [cont_8141]
                                                               ;    4: $80d8 [cont_80d8]

                ;
                ; Output
                ;   dat_aa0f   - Set to 0
                ;   dat_0091   - Increased by 2
                ;   C          - 1 if dat_0091 overflowed otherwise 0
                ;
8093: a9 00     cont_8093       LDA #$00             ; Set
8095: 8d 0f aa                  STA dat_aa0f         ;     dat_aa0f = 0
8098: 18                        CLC                  ; Set
8099: a5 91                     LDA dat_0091         ;     dat_0091
809b: 69 02                     ADC #$02             ;        =
809d: 85 91                     STA dat_0091         ;          dat_0091 + 2   (C = 1 on overflow else 0)
809f: 60                        RTS                  ; Return to caller

                ;
                ; Output
                ;   dat_0092  - Set to $ff
                ;   dat_009b  - Set to 1
                ;   dat_00a0  - Adds 1 and clamps to a maximum of 2
                ;   dat_00a1  - Adds 1 and clamps to a maximum of 2
                ;
80a0: a5 a0     cont_80a0       LDA dat_00a0         ; Set A = dat_00a0
80a2: 20 04 81                  JSR add1Max2         ; Call $8104 [add1Max2]  (in A, out A)
80a5: 85 a0                     STA dat_00a0         ; Set dat_00a0 = A
80a7: a9 01                     LDA #$01             ; Set
80a9: 85 9b                     STA dat_009b         ;     dat_009b = 1
80ab: a5 a1                     LDA dat_00a1         ; Set A = dat_00a1
80ad: 20 04 81                  JSR add1Max2         ; Call $8104 [add1Max2]  (in A, out A)
80b0: 85 a1                     STA dat_00a1         ; Set dat_00a1 = A
80b2: a9 ff                     LDA #$ff             ; Set
80b4: 85 92                     STA dat_0092         ;     dat_0092 = $ff
80b6: 60                        RTS                  ; Return to caller

                ;
                ;
                ;
80b7: ad 27 aa  cont_80b7       LDA FoeInt           ; If (FoeInt != 0)
80ba: f0 1b                     BEQ loc_80d7         ; Then
80bc: ae 00 aa                  LDX FoeCount         ;     Set FoeNum
80bf: ca                        DEX                  ;            =
80c0: 86 76                     STX FoeNum           ;              FoeCount - 1
80c2: 20 0e 81  loc_80c2        JSR sub_810e         ;     Loop
                                                     ;         Call $810e [sub_810e]
80c5: a5 78                     LDA dat_0078         ;         If (dat_0078 < 0)
80c7: 10 0a                     BPL loc_80d3         ;         Then
80c9: a5 76                     LDA FoeNum           ;             Set X
80cb: 0a                        ASL                  ;                   =
80cc: aa                        TAX                  ;                     FoeNum << 1
80cd: b5 c3                     LDA dat_00c3,X       ;             dat_00c3[X]
80cf: 09 80                     ORA #$80             ;                         =
80d1: 95 c3                     STA dat_00c3,X       ;                           dat_00c3[X] | $80
                                                     ;         End If
80d3: c6 76     loc_80d3        DEC FoeNum           ;         Subtract 1 from FoeNum
80d5: 10 eb                     BPL loc_80c2         ;     Repeat while (FoeNum >= 0)
                                                     ; End If
80d7: 60        loc_80d7        RTS                  ; Return to caller

                ;
                ;
                ;
80d8: ae 00 aa  cont_80d8       LDX FoeCount         ; Set X = FoeCount
80db: 2c                        .BYTE $25c           ; Forms 'BIT $01a2' (NOP) with the next 2 bytes to skip the LDX

                ;
                ;
                ;
80dc: a2 01     cont_80dc       LDX #$01             ; Set X = 1                (only if called via cont_80dc)
80de: ca                        DEX                  ; Subtract 1 from X
80df: 86 76                     STX FoeNum           ; Set FoeNum = X
80e1: ad 20 aa                  LDA Foe_aa20         ; If
80e4: 29 10                     AND #$10             ;    (Foe_aa20 & $10 == 0)
80e6: d0 1b                     BNE loc_8103         ; Then
80e8: 20 0e 81  loc_80e8        JSR sub_810e         ;     Loop
                                                     ;         Call $810e [sub_810e]
80eb: a0 00                     LDY #$00             ;         Set Y = 0
80ed: a5 78                     LDA dat_0078         ;         If (dat_0078 != 0) Then
80ef: f0 0e                     BEQ loc_80ff         ;             If (dat_0078 >= 0) Then
80f1: 10 01                     BPL loc_80f4         ;                 Add 1 to Y
80f3: c8                        INY                  ;             End If
80f4: c8        loc_80f4        INY                  ;             Add 1 to Y
80f5: a5 76                     LDA FoeNum           ;             Set X
80f7: 0a                        ASL                  ;                   =
80f8: aa                        TAX                  ;                     FoeNum << 1
80f9: 98                        TYA                  ;             Set
80fa: 18                        CLC                  ;                 dat_00c2[X]
80fb: 75 c2                     ADC dat_00c2,X       ;                    =
80fd: 95 c2                     STA dat_00c2,X       ;                      dat_00c2[X] + Y
                                                     ;         End If
80ff: c6 76     loc_80ff        DEC FoeNum           ;         Subtract 1 from FoeNum
8101: 10 e5                     BPL loc_80e8         ;     Repeat while (FoeNum >= 0)
                                                     ; End If
8103: 60        loc_8103        RTS                  ; Return to caller

                ; Adds one to the value in A and clamps the result to a max of 2.
                ;
                ; Input
                ;   A    - The value to update
                ;
                ; Output
                ;   A    - The modified value, max 2
                ;   C    - 0 if the value was not clamped, 1 if it was clamped to 2
                ;
8104: 18        add1Max2        CLC                  ; Set
8105: 69 01                     ADC #$01             ;     A = A + 1    (C = 1 on overflow else 0)
8107: c9 02                     CMP #$02             ; If (A >= 2)
8109: 90 02                     BCC loc_810d         ; Then
810b: a9 02                     LDA #$02             ;     Set A = 2
                                                     ; End If
810d: 60        loc_810d        RTS                  ; Return to caller

                ; Displays a message with the spell effect and waits for 3 vblanks.
                ;
                ;
810e: 20 f6 92  sub_810e        JSR sub_92f6         ; Call $sub_92f6 [sub_92f6]
8111: a9 66                     LDA #$66             ; Set
8113: 85 16                     STA StrTmplate_L     ;     StrTmplate_L/H
8115: a9 a1                     LDA #$a1             ;     to
8117: 85 17                     STA StrTmplate_H     ;     $a166 [StrItSpllEffct]
8119: 20 15 18                  JSR j_printBtm       ; Call $1815 [j_printBtm]
811c: a2 03                     LDX #$03             ; Set X = 3  (3 iterations [3..1])
811e: 20 80 92  loc_811e        JSR waitForVblankC   ; Loop
                                                     ;     Call $9280 [waitForVblankC]
8121: ca                        DEX                  ;     Subtract 1 from X
8122: d0 fa                     BNE loc_811e         ; Repeat while (X != 0)
8124: 60                        RTS                  ; Return to caller

                ;
                ;
                ;
8125: 20 8d 94  cont_8125       JSR sub_948d         ; Call $948d [sub_948d]
8128: ad 3c 63                  LDA ChrExpLevel      ; Set A = ChrExpLevel
812b: c9 0f                     CMP #$0f             ; If (A >= $f (15)) Then
812d: 90 02                     BCC loc_8131         ;     Set A = $e (14)
812f: a9 0e                     LDA #$0e             ; End If
8131: 0a        loc_8131        ASL                  ; Set
8132: 0a                        ASL                  ;     A
8133: 0a                        ASL                  ;       =
8134: 0a                        ASL                  ;         A << 4           (C = 0 since top 4 bits of A were 0)
8135: 69 14                     ADC #$14             ; Set A = A + $14 (20)
8137: 8d de 63                  STA Chr_SharpDmg     ; Set Chr_SharpDmg = A
813a: 60                        RTS                  ; Return to caller

                ;
                ;
                ;
813b: a9 00     cont_813b       LDA #$00             ; Set
813d: 8d 0f aa                  STA dat_aa0f         ;     dat_aa0f = 0
8140: 60                        RTS                  ; Return to caller

                ;
                ;
                ;
8141: 20 8d 94  cont_8141       JSR sub_948d         ; Call $948d [sub_948d]
8144: a2 0a                     LDX #$0a             ; Set X = 10
8146: bd 37 aa  loc_8146        LDA FoeProt,X        ; Loop
8149: f0 11                     BEQ loc_815c         ;     If (FoeProt[X] != 0   (0000_0000)
814b: c9 f0                     CMP #$f0             ;        And
814d: f0 0d                     BEQ loc_815c         ;        (FoeProt[X] != $f0 (1111_0000))
814f: c9 0f                     CMP #$0f             ;        And
8151: f0 09                     BEQ loc_815c         ;        (FoeProt[X] != $0f (0000_1111))
8153: c9 ff                     CMP #$ff             ;        And
8155: f0 05                     BEQ loc_815c         ;        (FoeProt[X] != $ff (1111_1111))
8157: a9 00                     LDA #$00             ;     Then
8159: 9d 37 aa                  STA FoeProt,X        ;         Set FoeProt[X] = 0
                                                     ;     End If
815c: ca        loc_815c        DEX                  ;     Subtract 1 from X
815d: 10 e7                     BPL loc_8146         ; Repeat while (X >= 0)
815f: 60                        RTS                  ; Return to caller

                ;
                ; Input
                ;   dat_0064_L  - Address of player weapon attributes
                ;
8160: 20 8d 94  cont_8160       JSR sub_948d         ; Call $948d [sub_948d]
8163: 2c 9c 63                  BIT ChrPriWeapon     ; If (ChrPriWeapon & $80 == 0)                   (weapon equipped)
8166: 30 4b                     BMI loc_81b3         ; Then
8168: a0 00                     LDY #$00             ;     Set Y = 0
816a: b1 64                     LDA (dat_0064_L),Y   ;     If
816c: c9 ff                     CMP #$ff             ;        ((*dat_0064_L)[0] != $ff)               (takes ammo)
816e: f0 1f                     BEQ loc_818f         ;     Then
8170: c8                        INY                  ;         Add 1 to Y
8171: b1 64                     LDA (dat_0064_L),Y   ;         If ((*dat_0064_L)[1] == 0)
8173: d0 07                     BNE loc_817c         ;         Then                                   (no ammo)
8175: a2 9d                     LDX #$9d             ;             Set
8177: a0 b8                     LDY #$b8             ;                 Y/X = $9db8 [StrNotLoaded]
8179: 4c d1 8e                  JMP dsplyMsg4Secs    ;             Continue @ $8ed1 [dsplyMsg4Secs]   (in Y/X)
                                                     ;         End If
817c: 38        loc_817c        SEC                  ;         Set
817d: e9 01                     SBC #$01             ;             (*dat_0064_L)[1]
817f: 91 64                     STA (dat_0064_L),Y   ;                  = (*dat_0064_L)[1] - 1        (decrease ammo)
8181: ad 9c 63                  LDA ChrPriWeapon     ;         Set
8184: 85 4b                     STA ItemIndex        ;             ItemIndex = ChrPriWeapon
8186: 20 87 18                  JSR j_getItemAdr     ;         Call $1887 [j_getItemAdr]
8189: 20 96 18                  JSR j_getItemAttrs   ;         Call $1896 [j_getItemAttrs]
818c: 20 9c 18                  JSR j_sub_5471       ;         Call $189c [j_sub_5471]
                                                     ;     End If
818f: a9 02     loc_818f        LDA #$02             ;     Set
8191: 18                        CLC                  ;         dat_0064_L
8192: 65 64                     ADC dat_0064_L       ;            =
8194: 85 64                     STA dat_0064_L       ;              dat_0064_L + 2          (Skip past ammo properties)
8196: 90 02                     BCC loc_819a         ;     If (C == 1) Then
8198: e6 65                     INC dat_0064_H       ;         Add 1 to dat_0064_H
                                                     ;     End If
819a: a0 0f     loc_819a        LDY #$0f             ;     Set Y = 15
819c: b1 64                     LDA (dat_0064_L),Y   ;     Set A
819e: 4a                        LSR                  ;           =
819f: 4a                        LSR                  ;             (*dat_0064_L)[15] >> 3         (flags)
81a0: 4a                        LSR                  ;                &
81a1: 29 07                     AND #$07             ;                  7
81a3: c9 04                     CMP #$04             ;     If (A >= 4)
81a5: 90 07                     BCC loc_81ae         ;     Then
81a7: 29 03                     AND #$03             ;         Set
81a9: 38                        SEC                  ;             A
81aa: e9 01                     SBC #$01             ;               =
81ac: 49 ff                     EOR #$ff             ;                 ~((A & 3) - 1)
                                                     ;     End If
81ae: 18        loc_81ae        CLC                  ;     Set dat_00a0
81af: 65 a0                     ADC dat_00a0         ;            =
81b1: 85 a0                     STA dat_00a0         ;              dat_00a0 + A
                                                     ; End If
81b3: 18        loc_81b3        CLC                  ; Set
81b4: a5 a0                     LDA dat_00a0         ;     dat_0077
81b6: 69 06                     ADC #$06             ;        =
81b8: 38                        SEC                  ;          (dat_00a0 + 6)
81b9: e5 a3                     SBC dat_00a3         ;              -
81bb: 85 77                     STA dat_0077         ;                dat_00a3
81bd: a0 0b                     LDY #$0b             ; Set Y = 11
81bf: ad 59 63                  LDA ChrStrCalc       ; If
81c2: d1 64                     CMP (dat_0064_L),Y   ;    (ChrStrCalc < (*dat_0064_L)[11])         (strength req. check)
81c4: b0 1c                     BCS loc_81e2         ; Thens
81c6: c6 9b                     DEC dat_009b         ;     Subtract 1 from dat_009b      (STR too low, subtract 1 from ?)
81c8: a0 0f                     LDY #$0f             ;     Set Y = 15
81ca: b1 64                     LDA (dat_0064_L),Y   ;     If
81cc: 0a                        ASL                  ;        ((*dat_0064_L)[15] & $40) == 0)      (double-handed?)
81cd: 30 13                     BMI loc_81e2         ;        And
81cf: ad 9d 63                  LDA ChrSecWeapon     ;        (ChrSecWeapon >= 0)                  (secondary equipped)
81d2: 30 0e                     BMI loc_81e2         ;        And (
81d4: ad 59 63                  LDA ChrStrCalc       ;           (ChrStrCalc >= $80 (128)          (is STR more than
81d7: 0a                        ASL                  ;           Or                                     half the req?)
81d8: b0 06                     BCS loc_81e0         ;             [Set Y = 11]
81da: a0 0b                     LDY #$0b             ;           ((ChrStrCalc * 2) >= (*dat_0064_L)[11])     (str req)
81dc: d1 64                     CMP (dat_0064_L),Y   ;        )
81de: 90 02                     BCC loc_81e2         ;     Then
81e0: e6 9b     loc_81e0        INC dat_009b         ;         Add 1 to dat_009b
                                                     ;     End If
                                                     ; End If
81e2: a0 0f     loc_81e2        LDY #$0f             ; Set Y = 15
81e4: b1 64                     LDA (dat_0064_L),Y   ; If
81e6: 0a                        ASL                  ;    ((*dat_0064_L)[15] & $40 == 1)       (flags bit 6 set)
81e7: 10 02                     BPL loc_81eb         ; Then
81e9: c6 77                     DEC dat_0077         ;     Subtract 1 from dat_0077
                                                     ; End If
81eb: a0 0c     loc_81eb        LDY #$0c             ; Set Y = 12
81ed: ad 71 63                  LDA ChrSklCalc       ; If
81f0: d1 64                     CMP (dat_0064_L),Y   ;    (ChrSklCalc < (*dat_0064_L)[12])     (skill req. check)
81f2: b0 02                     BCS loc_81f6         ; Then
81f4: c6 77                     DEC dat_0077         ;     Subtract 1 from dat_0077
                                                     ; End If
81f6: 24 a5     loc_81f6        BIT dat_00a5         ; If (dat_00a5 < 0)                       (player is knocked down)
81f8: 10 02                     BPL loc_81fc         ; Then
81fa: c6 77                     DEC dat_0077         ;     Subtract 1 from dat_0077
                                                     ; End If
81fc: e6 77     loc_81fc        INC dat_0077         ; Add 1 to dat_0077
81fe: 24 c3                     BIT dat_00c3         ; If (dat_00c3 & $40 == 1)
8200: 50 10                     BVC loc_8212         ; Then
8202: c6 77                     DEC dat_0077         ;     Subtract 1 from dat_0077
8204: ad 20 aa                  LDA Foe_aa20         ;     Set       (subtract # bits set in bits 1 & 2 of Foe_aa20)
8207: 4a                        LSR                  ;         A = Foe_aa20 >> 1    (discard bit 0)
8208: a2 02                     LDX #$02             ;     Set X = 2                (2 iterations [2..1])
820a: 4a        loc_820a        LSR                  ;     Loop
                                                     ;         Set A = A >> 1       (C = old bit 0)
820b: 90 02                     BCC loc_820f         ;         If (C == 1) Then
820d: c6 77                     DEC dat_0077         ;             Subtract 1 from dat_0077
                                                     ;         End If
820f: ca        loc_820f        DEX                  ;         Subtract 1 from X
8210: d0 f8                     BNE loc_820a         ;     Repeat while (X != 0)
                                                     ; End If
8212: ad 3c 63  loc_8212        LDA ChrExpLevel      ; Set
8215: 0a                        ASL                  ;     A = ChrExpLevel << 1           (C = old bit 7)
8216: b0 09                     BCS loc_8221         ; If (C == 0) Then
8218: 6d 71 63                  ADC ChrSklCalc       ;    Set A = A + ChrSklCalc   (C = 1 on overflow)
821b: b0 04                     BCS loc_8221         ;     If (C == 0) Then
821d: 69 10                     ADC #$10             ;        Set A = A + $10 (16)
                                                     ;     End If
821f: 90 02                     BCC loc_8223         ;     If (C == 1) Then
                                                     ;         Set A = $ff                 (clamp at $ff (255))
                                                     ;     End If
                                                     ; Else
8221: a9 ff     loc_8221        LDA #$ff             ;     Set A = $ff                     (clamp at $ff (255))
                                                     ; End If
8223: a6 77     loc_8223        LDX dat_0077         ; Set X = dat_0077
8225: 20 0d 8f                  JSR sub_8f0d         ; Call $8f0d [sub_8f0d] (in A, X)
8228: d0 02                     BNE loc_822c         ; If (Z == 1) Then
822a: e6 9b                     INC dat_009b         ;     Add 1 to dat_009b
                                                     ; End If
822c: a5 c3     loc_822c        LDA dat_00c3         ; Set dat_00c3
822e: 29 7f                     AND #$7f             ;        =
8230: 85 c3                     STA dat_00c3         ;          dat_00c3 & $7f
8232: ad 9c 63                  LDA ChrPriWeapon     ; If (ChrPriWeapon >= 0)
8235: 30 0e                     BMI loc_8245         ;
8237: ad 20 aa                  LDA Foe_aa20         ;    And
823a: 29 20                     AND #$20             ;    (Foe_aa20 & $20 != 0)
823c: f0 07                     BEQ loc_8245         ; Then
823e: a9 00                     LDA #$00             ;     Set
8240: 85 a7                     STA dat_00a7_H       ;         dat_00a7_H = 0
8242: 85 a8                     STA dat_00a8_L       ;     Set dat_00a8_L = 0
8244: 60                        RTS                  ;     Return to caller
                                                     ; End If
8245: a5 78     loc_8245        LDA dat_0078         ; If (dat_0078 < 0) Then
8247: 10 03                     BPL loc_824c         ;     Continue @ $8451 [dispYouMiss]
8249: 4c 51 84                  JMP dispYouMiss      ; End If
824c: a5 91     loc_824c        LDA dat_0091         ; If (dat_0091 == 0)
824e: d0 2f                     BNE loc_827f         ; Then
8250: ad 29 aa                  LDA FoeSkl           ;     Set A = FoeSkl
8253: a2 01                     LDX #$01             ;     Set X = 1
8255: 20 15 8f                  JSR sub_8f15         ;     Call $8f15 [sub_8f15] (in A, X)
8258: 30 07                     BMI loc_8261         ;     If (N == 0) Then
825a: a2 9d                     LDX #$9d             ;         Set
825c: a0 ce                     LDY #$ce             ;             Y/X = $9dce [StrDodges]
825e: 4c d1 8e                  JMP dsplyMsg4Secs    ;         Continue @ $8ed1 [dsplyMsg4Secs]   (in Y/X)
                                                     ;     End If
8261: a0 10     loc_8261        LDY #$10             ;     Set Y = $10 (16)
8263: b1 6a                     LDA (FoeWpnAtrs_L),Y ;     If ((*FoeWpnAtrs_L)[16] != 0)
8265: f0 18                     BEQ loc_827f         ;     Then
8267: ad 29 aa                  LDA FoeSkl           ;         Set A
826a: 4a                        LSR                  ;               =
826b: 18                        CLC                  ;                 (FoeSkl >> 1)
826c: 71 6a                     ADC (FoeWpnAtrs_L),Y ;                    + (*FoeWpnAtrs_L)[16]
826e: a2 03                     LDX #$03             ;         Set X = 3
8270: 20 15 8f                  JSR sub_8f15         ;         Call $8f15 [sub_8f15] (in A, X)
8273: 30 0a                     BMI loc_827f         ;         If (N == 0) Then
8275: a2 a0                     LDX #$a0             ;             Set
8277: a0 e8                     LDY #$e8             ;                 Y/X = $a0e8 [StrItDeflects]
8279: 20 d1 8e                  JSR dsplyMsg4Secs    ;             Call $8ed1 [dsplyMsg4Secs]   (in Y/X)
827c: 4c 31 8e                  JMP decDurability    ;             Continue @ $8e31 [decDurability]
                                                     ;         End If
                                                     ;     End If
                                                     ; End If
827f: a0 0d     loc_827f        LDY #$0d             ; Set Y = $d (13)
8281: b1 64                     LDA (dat_0064_L),Y   ; If
8283: c9 01                     CMP #$01             ;    ((*dat_0064_L)[13] != 1)
8285: f0 07                     BEQ loc_828e         ;
8287: ad 0a d2                  LDA RANDOM           ;    Or
828a: c9 40                     CMP #$40             ;    (random byte < $40 (64))           (25% chance)
828c: b0 03                     BCS loc_8291         ; Then
828e: 20 31 8e  loc_828e        JSR decDurability    ;     Call $8e31 [decDurability]
                                                     ; End If
8291: ad 0a d2  loc_8291        LDA RANDOM           ; If
8294: cd 52 02                  CMP VBlankCounter    ;    (random byte == VBlankCounter)     (1/256 == 0.39% chance)
8297: d0 13                     BNE loc_82ac         ; Then
8299: ad 0a d2                  LDA RANDOM           ;     If (random byte >= 0)
829c: 30 0a                     BMI loc_82a8         ;     Then
829e: a9 01                     LDA #$01             ;         Set A = 1
82a0: a2 5a                     LDX #$5a             ;         Set X = $5a                    ($635a [ChrStrBase])
82a2: 20 78 18                  JSR j_incChrAttr8    ;         Call $1878 [j_incChrAttr8]
82a5: 4c ac 82                  JMP loc_82ac         ;     Else
82a8: a2 72     loc_82a8        LDX #$72             ;         Set X = $72                    ($6372 [ChrSklBase])
82aa: a9 01                     LDA #$01             ;         Set A = 1
                                                     ;         (Bug? Should there be a call to j_incChrAttr8 here?)
                                                     ;     End If
                                                     ; End If
82ac: ad 20 aa  loc_82ac        LDA Foe_aa20         ; If (Foe_aa20 < 0)
82af: 10 17                     BPL loc_82c8         ; Then
82b1: a0 0a                     LDY #$0a             ;     Set Y = $a (10)
82b3: a9 00                     LDA #$00             ;     Set A = 0
82b5: 19 d2 63  loc_82b5        ORA dat_63d2,Y       ;     Loop
                                                     ;         Set A = A | dat_63d2[Y]
82b8: c0 02                     CPY #$02             ;         If (Y >= 2) Then
82ba: 90 02                     BCC loc_82be         ;             Set A = A | (*dat_0064_L)[Y]
82bc: 11 64                     ORA (dat_0064_L),Y   ;         End If
82be: 88        loc_82be        DEY                  ;         Subtract 1 from Y
82bf: 10 f4                     BPL loc_82b5         ;     Repeat while (Y >= 0)
82c1: c9 00                     CMP #$00             ;     If (A == 0) Then
82c3: d0 03                     BNE loc_82c8         ;         Continue @ $8330 [loc_8330]
82c5: 4c 30 83                  JMP loc_8330         ;     End If
                                                     ; End If
82c8: a0 0a     loc_82c8        LDY #$0a             ; Set Y = $a (11 iterations [10..0])
82ca: b1 64     loc_82ca        LDA (dat_0064_L),Y   ; Loop
                                                     ;     Set A = (*dat_0064_L)[Y]
82cc: 20 8e 8f                  JSR rollDiceA        ;     Call $8f8e [rollDiceA] (in A; out A; X, Y unchanged)
82cf: 99 dd 63                  STA Chr_BluntDmg,Y   ;     Set Chr_BluntDmg[Y] = A
82d2: 88                        DEY                  ;     Subtract 1 from Y
82d3: 10 f5                     BPL loc_82ca         ; Repeat while (Y >= 0)
82d5: c8                        INY                  ; Add 1 to Y
82d6: b9 dd 63                  LDA Chr_BluntDmg,Y   ; If (Chr_BluntDmg[Y] != 0)
82d9: f0 06                     BEQ loc_82e1         ; Then
82db: b9 d2 63                  LDA dat_63d2,Y       ;     Set A = dat_63d2[Y]
82de: 20 ad 83                  JSR calcRndDmgAttr   ;     Call $83ad [calcRndDmgAttr] (in A, Y)
                                                     ; End If
82e1: c8        loc_82e1        INY                  ; Add 1 to Y
82e2: b9 dd 63                  LDA Chr_BluntDmg,Y   ; If (Chr_BluntDmg[Y] != 0)
82e5: f0 06                     BEQ loc_82ed         ; Then
82e7: b9 d2 63                  LDA dat_63d2,Y       ;     Set A = dat_63d2[Y]
82ea: 20 ad 83                  JSR calcRndDmgAttr   ;     Call $83ad [calcRndDmgAttr] (in A, Y)
                                                     ; End If
82ed: c8        loc_82ed        INY                  ; Add 1 to Y (10 iterations [1..10]
82ee: b9 d2 63  loc_82ee        LDA dat_63d2,Y       ; Loop
                                                     ;     Set A = dat_63d2[Y]
82f1: 20 ad 83                  JSR calcRndDmgAttr   ;     Call $83ad [calcRndDmgAttr] (in A, Y)
82f4: c8                        INY                  ;     Add 1 to Y
82f5: c0 0b                     CPY #$0b             ; Repeat
82f7: 90 f5                     BCC loc_82ee         ;    while (A < $b (11))
82f9: ad 59 63                  LDA ChrStrCalc       ; Set A = ChrStrCalc
82fc: 2c 9c 63                  BIT ChrPriWeapon     ; If (ChrPriWeapon & $80 == 0)
82ff: 30 0a                     BMI loc_830b         ;
8301: a0 0b                     LDY #$0b             ;    Or
8303: 38                        SEC                  ;       [Set Y = $b (11)]
8304: ad 59 63                  LDA ChrStrCalc       ;       [Set A = ChrStrCalc - (*dat_0064_L)[11]]
8307: f1 64                     SBC (dat_0064_L),Y   ;    (A >= 0)
8309: 90 25                     BCC loc_8330         ; Then
830b: 4a        loc_830b        LSR                  ;     Set
830c: 4a                        LSR                  ;         dat_007c
830d: 4a                        LSR                  ;            =
830e: 4a                        LSR                  ;              A >> 4
830f: 85 7c                     STA dat_007c         ;
8311: a2 01                     LDX #$01             ;     Set X = 1 (2 iterations [1..0])
8313: a5 7c     loc_8313        LDA dat_007c         ;     Loop
                                                     ;         Set
8315: 85 96                     STA dat_0096         ;             dat_0096 = dat_007c
8317: bd dd 63                  LDA Chr_BluntDmg,X   ;         If
831a: c5 7c                     CMP dat_007c         ;            (Chr_BluntDmg[X] < dat_007c)
831c: b0 02                     BCS loc_8320         ;         Then
831e: 85 96                     STA dat_0096         ;             Set dat_0096 = Chr_BluntDmg[X]
                                                     ;         End If
8320: 18        loc_8320        CLC                  ;         Set Chr_BluntDmg[X]
8321: 65 96                     ADC dat_0096         ;                =
8323: 9d dd 63                  STA Chr_BluntDmg,X   ;                  Chr_BluntDmg[X] + dat_0096
8326: 90 05                     BCC loc_832d         ;         If (C == 1) Then
8328: a9 ff                     LDA #$ff             ;             Set
832a: 9d dd 63                  STA Chr_BluntDmg,X   ;                 Chr_BluntDmg[X] = $ff
                                                     ;         End If
832d: ca        loc_832d        DEX                  ;         Subtract 1 from X
832e: 10 e3                     BPL loc_8313         ;     Repeat while (X >= 0)
                                                     ; End If
8330: 20 bc 83  loc_8330        JSR sub_83bc         ; Call $83bc [sub_83bc]
8333: 20 d7 83                  JSR sub_83d7         ; Call $83d7 [sub_83d7]
8336: 20 00 84                  JSR sub_8400         ; Call $8400 [sub_8400]
8339: 20 8f 8e                  JSR sub_8e8f         ; Call $8e8f [sub_8e8f]
833c: 38                        SEC                  ; Set
833d: a5 b3                     LDA FoeHpTbl_L       ;     FoeHpTbl_L
833f: e5 a8                     SBC dat_00a8_L       ;        =
8341: 85 b3                     STA FoeHpTbl_L       ;          FoeHpTbl_L - dat_00a8_L   (C = 1 on overflow else 0)
8343: a5 b2                     LDA FoeHpTbl_H       ; Set FoeHpTbl_H
8345: e5 a7                     SBC dat_00a7_H       ;        =
8347: 85 b2                     STA FoeHpTbl_H       ;          FoeHpTbl_H - dat_00a7_H - ~C
8349: b0 09                     BCS loc_8354         ; If (C == 0) Then
834b: a9 00                     LDA #$00             ;     Set
834d: 85 b2                     STA FoeHpTbl_H       ;         FoeHpTbl_H = 0
834f: 85 b3                     STA FoeHpTbl_L       ;     Set FoeHpTbl_L = 0
8351: 4c a5 83                  JMP loc_83a5         ; Else If
8354: a5 a7     loc_8354        LDA dat_00a7_H       ;    (dat_00a7_H != 0)
8356: d0 16                     BNE loc_836e         ;    Or (
8358: a5 a8                     LDA dat_00a8_L       ;      (dat_00a8_L != 0)
835a: f0 49                     BEQ loc_83a5         ;      And (dat_009b == 0)
835c: a5 9b                     LDA dat_009b         ;    )
835e: 30 45                     BMI loc_83a5         ;    Or (
8360: d0 0c                     BNE loc_836e         ;       (dat_00a8_L != 0)
8362: a5 b2                     LDA FoeHpTbl_H       ;       And (dat_009b > 0)
8364: d0 3f                     BNE loc_83a5         ;       And
8366: a5 b3                     LDA FoeHpTbl_L       ;           (FoeHpTbl_H == 0)
8368: 4a                        LSR                  ;       And
8369: 4a                        LSR                  ;           ((FoeHpTbl_L >> 2) < dat_00a8_L)
836a: c5 a8                     CMP dat_00a8_L       ;    )
836c: b0 37                     BCS loc_83a5         ; Then
836e: ad 0a d2  loc_836e        LDA RANDOM           ;     If
8371: c9 40                     CMP #$40             ;        (random byte < $40)            (64/256 = 25% chance)
8373: b0 30                     BCS loc_83a5         ;     Then
8375: ad 0a d2                  LDA RANDOM           ;         If (random byte >= 0) Then    (128/256 = 50% chance)
8378: 30 1b                     BMI loc_8395         ;         Then
837a: ad 20 aa                  LDA Foe_aa20         ;             If
837d: 29 08                     AND #$08             ;                (Foe_aa20 & 8 == 0)
837f: d0 24                     BNE loc_83a5         ;                And
8381: 24 c3                     BIT dat_00c3         ;                (dat_00c3 & $40 == 0)
8383: 70 20                     BVS loc_83a5         ;             Then
8385: a5 c3                     LDA dat_00c3         ;                 Set dat_00c3
8387: 09 40                     ORA #$40             ;                        =
8389: 85 c3                     STA dat_00c3         ;                          dat_00c3 | $40
838b: a2 9e                     LDX #$9e             ;                 Set
838d: a0 4a                     LDY #$4a             ;                     Y/X = $9e4a [StrItKnckdDwn]
838f: 20 d1 8e                  JSR dsplyMsg4Secs    ;                 Call $8ed1 [dsplyMsg4Secs]   (in Y/X)
                                                     ;             End If
8392: 4c a5 83                  JMP loc_83a5         ;         Else If
8395: ad 20 aa  loc_8395        LDA Foe_aa20         ;            (Foe_aa20 & $10 == 0)
8398: 29 10                     AND #$10             ;
839a: d0 09                     BNE loc_83a5         ;         Then
839c: e6 c2                     INC dat_00c2         ;             Add 1 to dat_00c2
839e: a2 9e                     LDX #$9e             ;             Set
83a0: a0 7c                     LDY #$7c             ;                 Y/X = $9e7c [StrIsStaggered]
83a2: 20 d1 8e                  JSR dsplyMsg4Secs    ;             Call $8ed1 [dsplyMsg4Secs]   (in Y/X)
                                                     ;         End If
                                                     ;     End If
                                                     ; End If
83a5: a2 9e     loc_83a5        LDX #$9e             ; Set
83a7: a0 8f                     LDY #$8f             ;     Y/X = $9e8f [StrYouAttack]
83a9: 20 d1 8e                  JSR dsplyMsg4Secs    ; Call $8ed1 [dsplyMsg4Secs]   (in Y/X)
83ac: 60                        RTS                  ; Return to caller

                ; Calculates a random value and assigns it to a damage attribute.
                ;
                ; Input
                ;   A   - byte containing the number of dice to roll in the high nibble and the number of sides of
                ;         the dice in the low nibble.
                ;            DDDD SSSS
                ;              |    +-- Number of sides
                ;              +------- Number of dice to roll
                ;   Y   - Offset of the damage attribute to update (0..10)
                ;
                ; Output
                ;   A               - Calculated damage value
                ;   C               - 1 if the result was clamped to 255 otherwise 0
                ;   Chr_BluntDmg[Y] - Assigned the calculated damage value
                ;
83ad: 20 8e 8f  calcRndDmgAttr  JSR rollDiceA        ; Call $8f8e [rollDiceA] (in A; out A; X, Y unchanged)
83b0: 18                        CLC                  ; Set
83b1: 79 dd 63                  ADC Chr_BluntDmg,Y   ;     A = A + Chr_BluntDmg[Y]
83b4: 90 02                     BCC loc_83b8         ; If (C == 1) Then                (clamp to $ff (255) on overflow)
83b6: a9 ff                     LDA #$ff             ;     Set A = $ff
                                                     ; End If
83b8: 99 dd 63  loc_83b8        STA Chr_BluntDmg,Y   ; Set Chr_BluntDmg[Y] = A
83bb: 60                        RTS                  ; Return to caller

                ;
                ;
                ;
83bc: a2 00     sub_83bc        LDX #$00             ; Set X = 0
83be: ad 0c aa                  LDA FoeAlign         ; If
83c1: c9 80                     CMP #$80             ;    (FoeAlign == $80)
83c3: d0 07                     BNE loc_83cc         ; Then
83c5: 8e e5 63                  STX Chr_GoodDmg      ;     Set Chr_GoodDmg = 0
83c8: 8e e6 63                  STX Chr_EvilDmg      ;     Set Chr_EvilDmg = 0
83cb: 60                        RTS                  ;     Return to caller
                                                     ; End If
83cc: a8        loc_83cc        TAY                  ; Set Y = FoeAlign
83cd: 10 04                     BPL loc_83d3         ; If (Y < 0) Then
83cf: 8e e5 63                  STX Chr_GoodDmg      ;     Set Chr_GoodDmg = 0
83d2: 60                        RTS                  ;     Return to caller
                                                     ; End If
83d3: 8e e6 63  loc_83d3        STX Chr_EvilDmg      ; Set Chr_EvilDmg = 0
83d6: 60                        RTS                  ; Return to caller

                ;
                ;
                ;
83d7: a4 9b     sub_83d7        LDY dat_009b         ; Set Y = dat_009b
83d9: f0 16                     BEQ loc_83f1         ; If (Y == 0) Then
                                                     ;     Return to caller
                                                     ; End If
83db: 30 15                     BMI loc_83f2         ; If (Y > 0) Then
83dd: a2 01                     LDX #$01             ;     Set X = 1 (2 iterations [1..0])
83df: a4 9b     loc_83df        LDY dat_009b         ;     Loop
                                                     ;         Set Y = dat_009b
83e1: 1e dd 63  loc_83e1        ASL Chr_BluntDmg,X   ;         Loop
                                                     ;             Chr_BluntDmg[X] = Chr_BluntDmg[X] << 1
83e4: 90 05                     BCC loc_83eb         ;             If (C = 1) Then
83e6: a9 ff                     LDA #$ff             ;                 Set
83e8: 9d dd 63                  STA Chr_BluntDmg,X   ;                    Chr_BluntDmg[X] = $ff
                                                     ;             End If
83eb: 88        loc_83eb        DEY                  ;             Subtract 1 from Y
83ec: d0 f3                     BNE loc_83e1         ;         Repeat while (Y != 0)
83ee: ca                        DEX                  ;         Subtract 1 from X
83ef: 10 ee                     BPL loc_83df         ;     Repeat while (X >= 0)
83f1: 60        loc_83f1        RTS                  ; End If
83f2: a2 01     loc_83f2        LDX #$01             ; Set X = 1  (2 iterations [1..0])
83f4: a4 9b     loc_83f4        LDY dat_009b         ; Loop
                                                     ;     Set Y = dat_009b
83f6: 5e dd 63  loc_83f6        LSR Chr_BluntDmg,X   ;     Loop
                                                     ;         Set Chr_BluntDmg[X] = Chr_BluntDmg[X] >> 1
83f9: 88                        DEY                  ;         Subtract 1 from Y
83fa: d0 fa                     BNE loc_83f6         ;     Repeat while (Y != 0)
83fc: ca                        DEX                  ;     Subtract 1 from X
83fd: 10 f5                     BPL loc_83f4         ; Repeat while (X >= 0)
83ff: 60                        RTS                  ; Return to caller

                ;
                ;
                ;
8400: a9 00     sub_8400        LDA #$00             ; Set
8402: 85 7d                     STA dat_007d         ;     dat_007d = 0
8404: a2 0a                     LDX #$0a             ; Set X = $a (10)
8406: bd 37 aa  loc_8406        LDA FoeProt,X        ; Loop
8409: f0 42                     BEQ loc_844d         ;     If (FoeProt[X] != 0) Then
840b: c9 ff                     CMP #$ff             ;          .
840d: f0 16                     BEQ loc_8425         ;          . (loc_8425)
840f: c9 10                     CMP #$10             ;          .
8411: 90 1a                     BCC loc_842d         ;          . (loc_842d)
8413: 29 0f                     AND #$0f             ;          .
8415: d0 23                     BNE loc_843a         ;          . (loc_843a)
8417: bd dd 63                  LDA Chr_BluntDmg,X   ;          . (see final else below)
841a: 18                        CLC                  ;          .
841b: 65 7d                     ADC dat_007d         ;          .
841d: 85 7d                     STA dat_007d         ;          .
841f: 90 04                     BCC loc_8425         ;          .
8421: a9 ff                     LDA #$ff             ;          .
8423: 85 7d                     STA dat_007d         ;          .
8425: a9 00     loc_8425        LDA #$00             ;         If (FoeProt[X] == $ff) Then
8427: 9d dd 63                  STA Chr_BluntDmg,X   ;             Set Chr_BluntDmg[X] = 0
842a: 4c 4d 84                  JMP loc_844d         ;
842d: 1e dd 63  loc_842d        ASL Chr_BluntDmg,X   ;         Else If (FoeProt[X] < $10 (16)) Then
8430: 90 1b                     BCC loc_844d         ;             Set Chr_BluntDmg[X] = Chr_BluntDmg[X] << 1
8432: a9 ff                     LDA #$ff             ;             If (C == 1) Then       (overflow)
8434: 9d dd 63                  STA Chr_BluntDmg,X   ;                 Set Chr_BluntDmg[X] = $ff
8437: 4c 4d 84                  JMP loc_844d         ;             End If
843a: bd 37 aa  loc_843a        LDA FoeProt,X        ;         Else If (FoeProt[X] & $f != 0) Then
843d: 20 8e 8f                  JSR rollDiceA        ;             Set A = FoeProt[X]
8440: 38                        SEC                  ;             Call $8f8e [rollDiceA] (in A, out DiceRoll_L, X unchg)
8441: bd dd 63                  LDA Chr_BluntDmg,X   ;             Set A = Chr_BluntDmg[X] - DiceRoll_L
8444: e5 7a                     SBC DiceRoll_L       ;             If (C == 0) Then       (underflow)
8446: b0 02                     BCS loc_844a         ;                 Set A = 0
8448: a9 00                     LDA #$00             ;             End If
844a: 9d dd 63  loc_844a        STA Chr_BluntDmg,X   ;             Set Chr_BluntDmg[X] = A
                                                     ;         Else
                                                     ;             Set dat_007d                                  ($8417)
                                                     ;                    =
                                                     ;                      dat_007d + Chr_BluntDmg[X]
                                                     ;             If (C == 1) Then
                                                     ;                 Set dat_007d = $ff
                                                     ;             End If
                                                     ;             Set Chr_BluntDmg[X] = 0
                                                     ;         End If
                                                     ;     End If
844d: ca        loc_844d        DEX                  ;     Subtract 1 from X
844e: 10 b6                     BPL loc_8406         ; Repeat while (X >= 0)
8450: 60                        RTS                  ; Return to caller

                ; Displays StrYouMiss for 1 second.
                ;
8451: a2 a0     dispYouMiss     LDX #$a0             ; Set
8453: a0 d9                     LDY #$d9             ;     Y/X = $a0d9 [StrYouMiss]
8455: 20 ef 8e                  JSR dsplyTmpltStr    ; Call $8eef [dsplyTmpltStr] (in Y/X)
8458: a9 01                     LDA #$01             ; Set A = 1
845a: 20 5a 18                  JSR j_waitSeconds    ; Call $185a [j_waitSeconds]
845d: 60                        RTS                  ; Return to caller

                ; Adds the value in A to the little-endian uint16 value in UInt16Val_L/H
                ;
                ; Input
                ;   A    - Amount to add
                ;
                ; Output
                ;   UInt16Val_L/H - Increased by the value in A
                ;   C             - 1 if the LSB of the result overflowed, 0 otherwise
                ;                   (Note: This can't be used to determine if the MSB overflowed and is not very useful)
                ;
845e: 18        addByte16       CLC                  ; Set UInt16Val_L
845f: 65 02                     ADC UInt16Val_L      ;        =
8461: 85 02                     STA UInt16Val_L      ;          A + UInt16Val_L
8463: 90 02                     BCC loc_8467         ; If (C == 1) Then
8465: e6 03                     INC UInt16Val_H      ;     Add 1 to UInt16Val_H
                                                     ; End If
8467: 60        loc_8467        RTS                  ; Return to caller

                ;
                ;
                ;
8468: 20 cd 90  cont_8468       JSR rmveAllDropped   ; Call $90cd [rmveAllDropped]
846b: a9 23                     LDA #$23             ; Set A = $23 (35)
846d: 20 99 18                  JSR j_randInRange    ; Call $1899 [j_randInRange] (in A, out A [0..35])
8470: 8d 5b 19                  STA dat_195b         ; Set dat_195b = A
8473: a9 23                     LDA #$23             ; Set A = $23 (35)
8475: 20 99 18                  JSR j_randInRange    ; Call $1899 [j_randInRange] (in A, out A [0..35])
8478: 8d 5c 19                  STA dat_195c         ; Set dat_195c = A
847b: ad 0a d2                  LDA RANDOM           ; Set CHR_LOC_ORIENT
847e: 29 03                     AND #$03             ;         =
8480: 8d 12 63                  STA CHR_LOC_ORIENT   ;           random byte & 3
8483: ad 0a d2                  LDA RANDOM           ; If (random byte >= 0)
8486: 30 15                     BMI cont_849d        ; Then
8488: 20 6f 88                  JSR sub_886f         ;     Call $886f [sub_886f]  (in ?)
848b: 90 10                     BCC cont_849d        ;     If (C == 1)
848d: a5 ab                     LDA dat_00ab         ;        And
848f: d0 0c                     BNE cont_849d        ;        (dat_00ab == 0)
8491: 2c 0c aa                  BIT FoeAlign         ;        And
8494: 10 07                     BPL cont_849d        ;        (FoeAlign & $80 != 0)
                                                     ;     Then
8496: a2 85                     LDX #$85             ;         Set X = $85  ($6385 [ChrAlign])
8498: a9 01                     LDA #$01             ;         Set A = 1
849a: 20 78 18                  JSR j_incChrAttr8    ;         Call $1878 [j_incChrAttr8] (in X, A)
                                                     ;     End If
                                                     ; End If

                ;
                ;
                ;
849d: 20 34 97  cont_849d       JSR sub_9734         ; Call $9734 [sub_9734]
84a0: 20 67 90                  JSR clrSmthngHere    ; Call $9067 [clrSmthngHere]
84a3: 20 72 92                  JSR unlkDroppdItms   ; Call $9272 [unlkDroppdItms]
84a6: ad 59 19                  LDA MapLocSpclType   ; If (MapLocSpclType == 0)
84a9: d0 0c                     BNE loc_84b7         ; Then
84ab: ad 18 63                  LDA CHR_SAV_LOC_X    ;     Set
84ae: 8d 13 63                  STA CHR_LOC_X        ;         CHR_LOC_X = CHR_SAV_LOC_X
84b1: ad 19 63                  LDA CHR_SAV_LOC_Y    ;     Set
84b4: 8d 14 63                  STA CHR_LOC_Y        ;         CHR_LOC_Y = CHR_SAV_LOC_Y
                                                     ; End If
84b7: 4c 6d 77  loc_84b7        JMP cont_776d        ; Continue @ $776d [cont_776d]

                ;
                ;
                ;
84ba: c6 8a     sub_84ba        DEC dat_008a         ; Subtract 1 from dat_008a
84bc: a5 8a                     LDA dat_008a         ; If
84be: 29 0f                     AND #$0f             ;    (dat_008a & $f == 0)
84c0: d0 03                     BNE loc_84c5         ; Then
84c2: 20 34 97                  JSR sub_9734         ;     Call $9734 [sub_9734]
                                                     ; End If
84c5: 20 72 90  loc_84c5        JSR sub_9072         ; Call $9072 [sub_9072]
84c8: a2 9c                     LDX #$9c             ; Set
84ca: a0 c9                     LDY #$c9             ;     Y/X = $9cc9 [Str_9cc9]
84cc: 4c d1 8e                  JMP dsplyMsg4Secs    ; Continue @ $8ed1 [dsplyMsg4Secs]   (in Y/X)

                ;
                ;
                ; Output
                ;   Foe_aa21   -
                ;   dat_a89d   -
                ;
84cf: ad 21 aa  sub_84cf        LDA Foe_aa21         ; Set
84d2: 29 0f                     AND #$0f             ;     Foe_aa21
84d4: 09 a0                     ORA #$a0             ;        =
84d6: 8d 21 aa                  STA Foe_aa21         ;          (Foe_aa21 & $f) | $a0
84d9: ee 9d a8                  INC dat_a89d         ; Add 1 to dat_a89d
84dc: 20 ba 84                  JSR sub_84ba         ; Call $84ba [sub_84ba]
84df: 20 00 91                  JSR sub_9100         ; Call $9100 [sub_9100]
84e2: ae 1b aa                  LDX FoeDeath_L       ; Set X/A = FoeDeath_L/H
84e5: ad 1c aa                  LDA FoeDeath_H       ; If (A != 0) Then
84e8: f0 03                     BEQ loc_84ed         ;     Continue @ $94e7 [contAtAddrXA] (in X/A)
84ea: 4c e7 94                  JMP contAtAddrXA     ; End If
84ed: 20 b2 85  loc_84ed        JSR sub_85b2         ; Call $85b2 [sub_85b2]
84f0: ad 1f aa                  LDA Foe_aa1f         ; If (Foe_aa1f != 0)
84f3: f0 09                     BEQ loc_84fe         ; Then
84f5: 8d 9b 76                  STA CorpseItem+4     ;     Set CorpseItem[4] = Foe_aa1f             (corpse item weight)
84f8: 20 60 85                  JSR initCorpseItem   ;     Call $8560 [initCorpseItem]
84fb: 4c 98 85                  JMP addCorpseItem    ;     Continue @ $8598 [addCorpseItem] & Return to caller
                                                     ; End If
84fe: a5 ab     loc_84fe        LDA dat_00ab         ; If (dat_00ab < 0)
8500: 10 1f                     BPL loc_8521         ;    And
8502: 2c 21 aa                  BIT Foe_aa21         ;    (Foe_aa21 & $80 == 0)
8505: 30 1a                     BMI loc_8521         ;    And
8507: a5 ad                     LDA dat_00ad         ;    (dat_00ad != 0)
8509: f0 16                     BEQ loc_8521         ; Then
850b: c9 c0                     CMP #$c0             ;     If (dat_00ad == $c0)
850d: f0 0b                     BEQ loc_851a         ;        Or (
850f: c9 40                     CMP #$40             ;          (dat_00ad != $40)
8511: f0 0e                     BEQ loc_8521         ;          And
8513: ad 0a d2                  LDA RANDOM           ;          (random byte < $40 (64))        (25% chance)
8516: c9 40                     CMP #$40             ;        )
8518: b0 07                     BCS loc_8521         ;     Then
851a: a2 85     loc_851a        LDX #$85             ;         Set X = $85  ($6385 [ChrAlign])
851c: a9 01                     LDA #$01             ;         Set A = 1
851e: 20 6f 18                  JSR j_decChrAttr8    ;         Call $186f [j_decChrAttr8]  (in A, X)
                                                     ;     End If
                                                     ; End If
8521: a5 8a     loc_8521        LDA dat_008a         ; If
8523: 29 0f                     AND #$0f             ;    ((dat_008a & $f) == 0)
8525: d0 03                     BNE loc_852a         ; Then
8527: 4c c2 7a                  JMP cont_7ac2        ;     Continue @ $7ac2 [cont_7ac2]
                                                     ; End If
852a: 60        loc_852a        RTS                  ; Return to caller

                ;
                ; Input
                ;   ChrExpLevel  -
                ;   Foe_aa0b     -
                ;   dat_a8a0     -
                ;
                ; Output
                ;   dat_758a     -
                ;   dat_758b     -
                ;
852b: ae 3c 63  sub_852b        LDX ChrExpLevel      ; Set X = ChrExpLevel
852e: f0 2f                     BEQ loc_855f         ; If (X != 0) Then
8530: ca                        DEX                  ;     Subtract 1 from X
8531: d0 05                     BNE loc_8538         ;     If (
8533: ad 0a d2                  LDA RANDOM           ;         (X == 0) Or (random byte >= 0)
8536: 30 27                     BMI loc_855f         ;        )
8538: ad 0b aa  loc_8538        LDA Foe_aa0b         ;        And (Foe_aa0b != 0)
853b: f0 22                     BEQ loc_855f         ;     Then
853d: ad 0a d2                  LDA RANDOM           ;         If
8540: cd a0 a8                  CMP dat_a8a0         ;            (random byte < dat_a8a0)
8543: b0 0a                     BCS loc_854f         ;         Then
8545: ad 0b aa                  LDA Foe_aa0b         ;             Set
8548: 4a                        LSR                  ;                 dat_758a
8549: 4a                        LSR                  ;                    =
854a: 4a                        LSR                  ;                      Foe_aa0b >> 4
854b: 4a                        LSR                  ;
854c: 8d 8a 75                  STA dat_758a         ;         End If
854f: ad 0a d2  loc_854f        LDA RANDOM           ;         If
8552: cd a0 a8                  CMP dat_a8a0         ;            (random byte < dat_a8a0)
8555: b0 08                     BCS loc_855f         ;         Then
8557: ad 0b aa                  LDA Foe_aa0b         ;             Set dat_758b
855a: 29 0f                     AND #$0f             ;                    =
855c: 8d 8b 75                  STA dat_758b         ;                      Foe_aa0b & $f
                                                     ;         End If
                                                     ;     End If
                                                     ; End If
855f: 60        loc_855f        RTS                  ; Return to caller

                ; Populates byte size and item name details into the CorpseItem and sets DestAdr_L/H
                ;     to $76b5 [CorpseItmAttrs].
                ;
                ; Output
                ;   CorpseItem[1]     - Item size in bytes. Assigned $21 (33)
                ;   CorpseItem[6..28] - Assigned the foe name + " corpse\0"
                ;   DestAdr_L/H       - Assigned $76b5 [CorpseItmAttrs]
                ;
8560: a9 21     initCorpseItem  LDA #$21             ; Set
8562: 8d 98 76                  STA CorpseItem+1     ;     CorpseItem[1] = $21 (33)                 (item size in bytes)
8565: a0 00                     LDY #$00             ; Set Y = 0
8567: ad 01 aa                  LDA FoeNameZts_L     ; Set
856a: 85 6e                     STA dat_006e_L       ;     dat_006e_L/H
856c: ad 02 aa                  LDA FoeNameZts_H     ;     to
856f: 85 6f                     STA dat_006f_H       ;     FoeNameZts_L/H
8571: b1 6e     loc_8571        LDA (dat_006e_L),Y   ; Loop                                         (copy foe name)
8573: 99 9d 76                  STA CorpseItem+6,Y   ;     Set CorpseItem[6 + Y] = (*dat_006e_L)[Y]
8576: f0 03                     BEQ loc_857b         ;     If (CorpseItem[6 + Y] == 0) Then
                                                     ;         Exit Loop       (found end of string)
                                                     ;     End If
8578: c8                        INY                  ;     Add 1 to Y
8579: d0 f6                     BNE loc_8571         ; Repeat while (Y != 0)
857b: a9 20     loc_857b        LDA #$20             ; Set
857d: 99 9d 76                  STA CorpseItem+6,Y   ;     CorpseItem[6 + Y] = $20 (32 " ")
8580: c8                        INY                  ; Add 1 to Y
8581: a2 00                     LDX #$00             ; Set X = 0   (7 iterations [0..6])            (append " corpse")
8583: bd 88 a8  loc_8583        LDA ZtsCorpse,X      ; Loop
8586: 99 9d 76                  STA CorpseItem+6,Y   ;     Set CorpseItem[6 + Y] = ZtsCorpse[X]
8589: c8                        INY                  ;     Add 1 to Y
858a: e8                        INX                  ;     Add 1 to X
858b: e0 07                     CPX #$07             ; Repeat
858d: 90 f4                     BCC loc_8583         ;    while (X < 7)
858f: a9 b5                     LDA #$b5             ; Set
8591: 85 09                     STA DestAdr_L        ;     DestAdr_L/H
8593: a9 76                     LDA #$76             ;     to
8595: 85 0a                     STA DestAdr_H        ;     $76b5 [CorpseItmAttrs]
8597: 60                        RTS                  ; Return to caller

                ; Assigns CorpseItem attributes and adds the item to the game inventory.
                ;
                ; Input
                ;   DestAdr_L/H  - Address of the item attributes to update
                ;                   A0: set to 2
                ;                   A1: set to 0
                ;                   A2: set to value of dat_008d
                ;                   A3: unmodified
                ;
8598: a0 00     addCorpseItem   LDY #$00             ; Set Y = 0
859a: a9 02                     LDA #$02             ; Set
859c: 91 09                     STA (DestAdr_L),Y    ;     (*DestAdr_L)[0] = 2
859e: 98                        TYA                  ; Set A = 0
859f: c8                        INY                  ; Add 1 to Y    (Y = 1)
85a0: 91 09                     STA (DestAdr_L),Y    ; Set (*DestAdr_L)[1] = 0
85a2: c8                        INY                  ; Add 1 to Y    (Y = 2)
85a3: a5 8d                     LDA dat_008d         ; Set
85a5: 91 09                     STA (DestAdr_L),Y    ;     (*DestAdr_L)[2] = dat_008d
85a7: 18                        CLC                  ; Set C = 0
85a8: a2 76                     LDX #$76             ; Set
85aa: a0 97                     LDY #$97             ;     Y/X = $7697 [CorpseItem]
85ac: ce 7b 19                  DEC ForceGetFlg      ; Subtract 1 from ForceGetFlg             (add to player inventory)
85af: 4c 84 18                  JMP j_addItem        ; Continue @ $1884 [j_addItem]

                ;
                ; Input
                ;   FactionNum  - Faction number/index
                ;   dat_85dc    -
                ;   dat_85dd    -
                ;
                ; Output
                ;   FactionRepute[FactionNum] -
                ;
85b2: a5 a6     sub_85b2        LDA FactionNum       ; If
85b4: c9 0e                     CMP #$0e             ;    (FactionNum < $e (14))
85b6: b0 23                     BCS loc_85db         ;
85b8: aa                        TAX                  ;
85b9: bd c2 63                  LDA FactionRepute,X  ;    And
85bc: 2c dd 85                  BIT dat_85dd         ;    (dat_85dd != 0)
85bf: f0 1a                     BEQ loc_85db         ; Then
85c1: 2c dc 85                  BIT dat_85dc         ;     If (dat_85dc == 0)
85c4: d0 09                     BNE loc_85cf         ;     Then
85c6: 18                        CLC                  ;         Set
85c7: 69 10                     ADC #$10             ;             A = FactionRepute[FactionNum] + $10 (16)
85c9: 2c dc 85                  BIT dat_85dc         ;         (already tested
85cc: d0 01                     BNE loc_85cf         ;            this, so... ain't gonna jump here)
85ce: 2c        else_85ce       .BYTE $2c            ;     Else
85cf: a9 40     loc_85cf        LDA $40              ;         Set A = $40 (64)
                                                     ;     End If
85d1: 9d c2 63                  STA FactionRepute,X  ;     Set FactionRepute[FactionNum] = A
85d4: a2 86                     LDX #$86             ;     Set X = $86  ($6386 [CHR_MORALE])
85d6: a9 0a                     LDA #$0a             ;     Set A = $a   (10)
85d8: 20 6f 18                  JSR j_decChrAttr8    ;     Call $186f [j_decChrAttr8]
                                                     ; End If
85db: 60        loc_85db        RTS                  ; Return to caller

85dc: 40        dat_85dc        .BYTE $40            ; ... related to faction repute ...
85dd: 8f        dat_85dd        .BYTE $8f            ;

                ;
                ;
                ;
85de: 20 7e 8d  sub_85de        JSR sub_8d7e         ; Call $8d7e [sub_8d7e]
85e1: a9 00                     LDA #$00             ; Set A = 0
85e3: a2 15                     LDX #$15             ; Set X = $15 (22 iterations [21..0])
85e5: 9d dd 63  loc_85e5        STA Chr_BluntDmg,X   ; Loop
                                                     ;     Set Chr_BluntDmg[X] = 0
85e8: ca                        DEX                  ;     Subtract 1 from X
85e9: 10 fa                     BPL loc_85e5         ; Repeat while (X >= 0)
85eb: a9 00                     LDA #$00             ; Set A = 0
85ed: 85 a7                     STA dat_00a7_H       ; Set dat_00a7_H = 0
85ef: 85 a8                     STA dat_00a8_L       ; Set dat_00a8_L = 0
85f1: 85 a2                     STA dat_00a2         ; Set dat_00a2 = 0
85f3: 85 a3                     STA dat_00a3         ; Set dat_00a3 = 0
85f5: 85 a4                     STA dat_00a4         ; Set dat_00a4 = 0
85f7: ad 8d 63                  LDA CHR_DIFFICULT_TO_HIT ; If (CHR_DIFFICULT_TO_HIT != 0)
85fa: f0 02                     BEQ loc_85fe         ; Then
85fc: c6 a2                     DEC dat_00a2         ;     Subtract 1 from dat_00a2
                                                     ; End If
85fe: 38        loc_85fe        SEC                  ; Set
85ff: a5 a2                     LDA dat_00a2         ;     dat_00a2
8601: e5 a1                     SBC dat_00a1         ;        =
8603: 85 a2                     STA dat_00a2         ;          dat_00a2 - dat_00a1
8605: ad 8e 63                  LDA CHR_638e         ; If (CHR_638e != 0)
8608: f0 02                     BEQ loc_860c         ; Then
860a: e6 a2                     INC dat_00a2         ;     Add 1 to dat_00a2
                                                     ; End If
860c: 24 a5     loc_860c        BIT dat_00a5         ; If (dat_00a5 < 0)                       (Player is knocked down)
860e: 10 02                     BPL loc_8612         ; Then
8610: e6 a2                     INC dat_00a2         ;     Add 1 to dat_00a2
                                                     ; End If
8612: ad 20 aa  loc_8612        LDA Foe_aa20         ; Set
8615: 29 01                     AND #$01             ;     dat_00a2
8617: 18                        CLC                  ;        =
8618: 65 a2                     ADC dat_00a2         ;          (Foe_aa20 & 1)
861a: 85 a2                     STA dat_00a2         ;              + dat_00a2
861c: ae 19 aa                  LDX dat_aa19_L       ; Set X = dat_aa19_L
861f: ad 1a aa                  LDA dat_aa19_H       ; Set A = dat_aa19_H
8622: f0 03                     BEQ loc_8627         ; If (A != 0) Then
8624: 4c e7 94                  JMP contAtAddrXA     ;     Continue @ $94e7 [contAtAddrXA] (in X/A)
                                                     ; End If
8627: bd 36 86  loc_8627        LDA ContTbl_8630_H,X ; Push ContTbl_8630_H[X]
862a: 48                        PHA                  ;     to stack
862b: bd 30 86                  LDA ContTbl_8630_L,X ; Push ContTbl_8630_L[X]
862e: 48                        PHA                  ;     to stack
862f: 60                        RTS                  ; Continue @ address on stack + 1

8630: 3b 0c 3b  ContTbl_8630_L  .BYTE $3b,$0c,$3b    ; 6 bytes: LSBs of continuation addresses
8633: 63 7f 97                  .BYTE $63,$7f,$97    ;

8636: 86 88 86  ContTbl_8630_H  .BYTE $86,$88,$86    ; 6 bytes: MSBs of continuation addresses
8639: 88 88 88                  .BYTE $88,$88,$88    ;   0: $863c [cont_863c]     3: $8864 [contRndFoeWpn]
                                                     ;   1: $880d [cont_880d]     4: $8880 [cont_8880]
                                                     ;   2: $863c [cont_863c]     5: $8898 [cont_8898]

                ;
                ;
                ;
863c: 20 b0 88  cont_863c       JSR sub_88b0         ; Call $88b0 [sub_88b0]
863f: 90 01                     BCC loc_8642         ; If (C == 1) Then
8641: 60        loc_8641        RTS                  ;     Return to caller
                                                     ; End If
8642: 20 6f 88  loc_8642        JSR sub_886f         ; Call $886f [sub_886f]
8645: 90 fa                     BCC loc_8641         ; If (C == 0) Then
                                                     ;     Return to caller
                                                     ; End If
8647: ad 27 aa                  LDA FoeInt           ; If
864a: f0 19                     BEQ loc_8665         ;    (FoeInt != 0)
864c: ad 0a d2                  LDA RANDOM           ;
864f: c9 10                     CMP #$10             ;    And
8651: b0 12                     BCS loc_8665         ;    (random byte < $10 (16))               (16/256 = 6.25% chance)
8653: ad 0a d2                  LDA RANDOM           ; Then
8656: e6 a2                     INC dat_00a2         ;     Add 1 to dat_00a2
8658: e6 a4                     INC dat_00a4         ;     Add 1 to dat_00a4
865a: c9 40                     CMP #$40             ;     If (random byte >= $40 (64))           (192/256 = 75% chance)
865c: 90 16                     BCC loc_8674         ;     Then
865e: a2 a2                     LDX #$a2             ;         Set
8660: a0 86                     LDY #$86             ;             Y/X = $a286 [StrWaitOpening]
8662: 4c ce 8e                  JMP dsplyMsg2Secs    ;         Continue @ $8ece [dsplyMsg2Secs]   (in Y/X) -> RTS
                                                     ;     End If
                                                     ; Else If
8665: a5 76     loc_8665        LDA FoeNum           ;    (FoeNum == 0)
8667: d0 0b                     BNE loc_8674         ;
8669: ad 0a d2                  LDA RANDOM           ;    And
866c: c9 20                     CMP #$20             ;    (random byte < $20 (32))               (32/256 = 12.5% chance)
866e: b0 04                     BCS loc_8674         ; Then
8670: e6 a2                     INC dat_00a2         ;     Add 1 to dat_00a2
8672: c6 a3                     DEC dat_00a3         ;     Subtract 1 from dat_00a3
                                                     ; End If
8674: 20 82 94  loc_8674        JSR sub_9482         ; Call $9482 [sub_9482]
8677: 18                        CLC                  ; Set
8678: a9 04                     LDA #$04             ;     dat_0077
867a: 65 a2                     ADC dat_00a2         ;        =
867c: 85 77                     STA dat_0077         ;          dat_00a2 + 4
867e: 18                        CLC                  ; Set C = 0
867f: ad 0d aa                  LDA FoeLevel         ; Set
8682: 0a                        ASL                  ;     A = FoeLevel << 1   (C = bit 7 of FoeLevel)
8683: b0 09                     BCS loc_868e         ; If (C == 0) Then
8685: 6d 29 aa                  ADC FoeSkl           ;     Set A = (FoeLevel << 1) + FoeSkl
8688: b0 04                     BCS loc_868e         ;     If (C == 0) Then
868a: 69 10                     ADC #$10             ;         Set A = A + $10
                                                     ;     End If
868c: 90 02                     BCC loc_8690         ; End If
                                                     ; If (C == 1) Then
868e: a9 ff     loc_868e        LDA #$ff             ;     Set A = $ff
                                                     ; End If
8690: a6 77     loc_8690        LDX dat_0077         ; Set X = dat_0077
8692: 20 15 8f                  JSR sub_8f15         ; Call $8f15 [sub_8f15] (in A, X)
8695: 10 07                     BPL loc_869e         ; If (N == 1) Then
8697: a2 a2                     LDX #$a2             ;     Set
8699: a0 7a                     LDY #$7a             ;         Y/X = $a27a [StrMisses]
869b: 4c ce 8e                  JMP dsplyMsg2Secs    ;     Continue @ $8ece [dsplyMsg2Secs]   (in Y/X) -> RTS
869e: d0 02     loc_869e        BNE loc_86a2         ; Else If (Z == 1) Then
86a0: e6 a4                     INC dat_00a4         ;     Add 1 to dat_00a4
                                                     ; End If
86a2: ad 71 63  loc_86a2        LDA ChrSklCalc       ; Set A
86a5: 4a                        LSR                  ;        =
86a6: 4a                        LSR                  ;          ChrSklCalc >> 2
86a7: a2 01                     LDX #$01             ; Set X = 1
86a9: 20 0d 8f                  JSR sub_8f0d         ; Call $8f0d [sub_8f0d] (in A, X)
86ac: 30 07                     BMI loc_86b5         ; If (N == 0) Then
86ae: a2 9d                     LDX #$9d             ;     Set
86b0: a0 eb                     LDY #$eb             ;         Y/X = $9deb [StrYouDodge]
86b2: 4c ce 8e                  JMP dsplyMsg2Secs    ;     Continue @ $8ece [dsplyMsg2Secs]   (in Y/X) -> RTS
                                                     ; End If
86b5: a0 00     loc_86b5        LDY #$00             ; Set Y = 0
86b7: b1 6a                     LDA (FoeWpnAtrs_L),Y ; Set
86b9: c8                        INY                  ;     dat_008e        (Y = 1)
86ba: 11 6a                     ORA (FoeWpnAtrs_L),Y ;        =
86bc: 85 8e                     STA dat_008e         ;          (*FoeWpnAtrs_L)[0] | (*FoeWpnAtrs_L)[1]
86be: f0 25                     BEQ loc_86e5         ; If (dat_008e != 0) Then
86c0: a0 12                     LDY #$12             ;     Set Y = $12 (18)
86c2: a5 67                     LDA dat_0066_H       ;     If (dat_0066_H != 0)
86c4: f0 1f                     BEQ loc_86e5         ;        And
86c6: b1 66                     LDA (dat_0066_L),Y   ;        (*dat_0066_L)[18] != 0
86c8: f0 1b                     BEQ loc_86e5         ;     Then
86ca: 18                        CLC                  ;         Set
86cb: 6d 71 63                  ADC ChrSklCalc       ;            A = (*dat_0066_L)[18] + ChrSklCalc
86ce: 90 02                     BCC loc_86d2         ;         If (C == 1) Then
86d0: a9 ff                     LDA #$ff             ;             Set A = $ff
                                                     ;         End If           (Bug? Should prob be else and skip >> 2)
86d2: 4a        loc_86d2        LSR                  ;         Set
86d3: 4a                        LSR                  ;             A = A >> 2
86d4: a2 03                     LDX #$03             ;         Set X = 3
86d6: 20 0d 8f                  JSR sub_8f0d         ;         Call $8f0d [sub_8f0d] (in A, X)
86d9: 30 0a                     BMI loc_86e5         ;         If (N == 0) Then
86db: a2 a4                     LDX #$a4             ;             Set
86dd: a0 b1                     LDY #$b1             ;                 Y/X = $a4b1 [StrYouBlock]
86df: 20 ce 8e                  JSR dsplyMsg2Secs    ;             Call $8ece [dsplyMsg2Secs]   (in Y/X)
86e2: 4c 2d 8e                  JMP contDecDurblty   ;             Continue @ $8e2d [contDecDurblty]
                                                     ;         End If
                                                     ;     End If
                                                     ; End If
86e5: a9 0a     loc_86e5        LDA #$0a             ; Set
86e7: 85 8b                     STA dat_008b         ;     dat_008b = $a                         (11 iterations [11..0])
86e9: a4 8b     loc_86e9        LDY dat_008b         ; Loop                           (Chr_BluntDmg through Chr_ColdDmg)
                                                     ;     Set Y = dat_008b
86eb: b1 6a                     LDA (FoeWpnAtrs_L),Y ;     Set A = (*FoeWpnAtrs_L)[Y]
86ed: 20 8e 8f                  JSR rollDiceA        ;     Call $8f8e [rollDiceA] (in A; out A; X, Y unchanged)
86f0: 99 dd 63                  STA Chr_BluntDmg,Y   ;     Set Chr_BluntDmg[Y] = A
86f3: c0 02                     CPY #$02             ;     If (Y < 2)
86f5: b0 13                     BCS loc_870a         ;        And
86f7: b9 dd 63                  LDA Chr_BluntDmg,Y   ;        (Chr_BluntDmg[Y] != 0)
86fa: f0 0e                     BEQ loc_870a         ;     Then
86fc: ad 26 aa                  LDA FoeStr           ;         Set
86ff: 4a                        LSR                  ;             Chr_BluntDmg[Y]
8700: 4a                        LSR                  ;                =
8701: 4a                        LSR                  ;                  Chr_BluntDmg[Y]
8702: 4a                        LSR                  ;                     +
8703: 18                        CLC                  ;                       (FoeStr >> 4)
8704: 79 dd 63                  ADC Chr_BluntDmg,Y   ;
8707: 99 dd 63                  STA Chr_BluntDmg,Y   ;     End If
870a: a5 a4     loc_870a        LDA dat_00a4         ;     Set A = dat_00a4
870c: f0 08                     BEQ loc_8716         ;     If (A != 0)
870e: a6 8b                     LDX dat_008b         ;         Set X = dat_008b
8710: 1e dd 63  loc_8710        ASL Chr_BluntDmg,X   ;         Loop
                                                     ;             Set Chr_BluntDmg[X] = Chr_BluntDmg[X] << 1
8713: 4a                        LSR                  ;             Set A = A >> 1
8714: d0 fa                     BNE loc_8710         ;         Repeat while (A != 0)       (up to 8 iterations)
                                                     ;     End If
8716: c6 8b     loc_8716        DEC dat_008b         ;     Subtract 1 from dat_008b
8718: 10 cf                     BPL loc_86e9         ; Repeat while (dat_008b >= 0)
871a: a9 01                     LDA #$01             ; Set
871c: 8d 9c a8                  STA dat_a89c         ;     dat_a89c = 1
871f: a5 8e                     LDA dat_008e         ; If
8721: f0 0d                     BEQ loc_8730         ;    (dat_008e != 0)
8723: ad 0a d2                  LDA RANDOM           ;    And (random byte >= 0)          (50% chance)
8726: 30 08                     BMI loc_8730         ; Then
8728: a9 03                     LDA #$03             ;     Set A = 3
872a: 20 99 18                  JSR j_randInRange    ;     Call $1899 [j_randInRange]   (in A (3), out A [0..3])
872d: 8d 9c a8                  STA dat_a89c         ;     Set dat_a89c = A
                                                     ; End If
8730: 20 8d 93  loc_8730        JSR calcFoeAtkDmg    ; Call $938d [calcFoeAtkDmg]
8733: 20 8f 8e                  JSR sub_8e8f         ; Call $8e8f [sub_8e8f]
8736: 38                        SEC                  ; Set
8737: ad 46 63                  LDA ChrHp_L          ;     ChrHp_L
873a: e5 a8                     SBC dat_00a8_L       ;        =
873c: 8d 46 63                  STA ChrHp_L          ;          ChrHp_L - dat_00a8_L         (C = 0 on underflow else 1)
873f: ad 45 63                  LDA ChrHp_H          ; Set ChrHp_H
8742: e5 a7                     SBC dat_00a7_H       ;        =
8744: 8d 45 63                  STA ChrHp_H          ;          ChrHp_H - dat_00a7_H - ~C    (C = 0 on underflow else 1)
8747: b0 08                     BCS loc_8751         ; If (C == 0) Then   (underflow)
8749: a9 00                     LDA #$00             ;     Set
874b: 8d 45 63                  STA ChrHp_H          ;         ChrHp_H = 0
874e: 8d 46 63                  STA ChrHp_L          ;     Set ChrHp_L = 0
                                                     ; End If
8751: a0 0f     loc_8751        LDY #$0f             ; Set Y = $f (15)
8753: b1 6a                     LDA (FoeWpnAtrs_L),Y ; Set
8755: 29 07                     AND #$07             ;     dat_008f
8757: 85 8f                     STA dat_008f         ;        = (*FoeWpnAtrs_L)[15] & 7      (F15: bitflags)
8759: a0 00                     LDY #$00             ; Set Y = 0
875b: b1 68                     LDA (FoeWpnAddr_L),Y ; If ((*FoeWpnAddr_L)[0] < 0)           (F0: <0 = intrinsic weapon)
875d: 10 06                     BPL loc_8765         ; Then
875f: a5 8f                     LDA dat_008f         ;     Set dat_008f
8761: 09 10                     ORA #$10             ;            =
8763: 85 8f                     STA dat_008f         ;              dat_008f | $10           (set bit 4 - intrinsic)
                                                     ; End If
8765: a5 a4     loc_8765        LDA dat_00a4         ; If (dat_00a4 != 0)
8767: f0 06                     BEQ loc_876f         ; Then
8769: a5 8f                     LDA dat_008f         ;     Set dat_008f
876b: 09 08                     ORA #$08             ;            =
876d: 85 8f                     STA dat_008f         ;              dat_008f | $08           (set bit 3 - alt. desc)
                                                     ; End If
876f: a6 8f     loc_876f        LDX dat_008f         ; Set X = dat_008f
8771: bd 71 a4                  LDA FoeAttckNms_L,X  ; Set
8774: 8d 7e 9f                  STA AttckDescZts_L   ;     AttckDescZts_L/H
8777: bd 91 a4                  LDA FoeAttckNms_H,X  ;     to
877a: 8d 7f 9f                  STA AttckDescZts_H   ;     FoeAttckNms_L/H[X]
877d: a2 a3                     LDX #$a3             ; Set
877f: a0 4b                     LDY #$4b             ;     Y/X = $a34b [Str_a34b]
8781: 20 ce 8e                  JSR dsplyMsg2Secs    ; Call $8ece [dsplyMsg2Secs]   (in Y/X)
8784: ad 9c a8                  LDA dat_a89c         ; If
8787: c9 01                     CMP #$01             ;    (dat_a89c != 1)
8789: f0 5a                     BEQ loc_87e5         ; Then
878b: a5 a7                     LDA dat_00a7_H       ;     If (dat_00a7_H == 0)
878d: d0 1a                     BNE loc_87a9         ;     Then
878f: a5 a8                     LDA dat_00a8_L       ;         If
8791: c9 04                     CMP #$04             ;            (dat_00a8_L >= 4)
8793: 90 50                     BCC loc_87e5         ;         Then
8795: ad 71 63                  LDA ChrSklCalc       ;            Set dat_0096
8798: 4a                        LSR                  ;                    =
8799: 85 96                     STA dat_0096         ;                      (ChrSklCalc >> 1)
879b: ad 49 63                  LDA ChrStaCalc       ;                        +
879e: 4a                        LSR                  ;                      (ChrStaCalc >> 1)
879f: 18                        CLC                  ;              .
87a0: 65 96                     ADC dat_0096         ;              .
87a2: a2 04                     LDX #$04             ;             Set X = 4
87a4: 20 0d 8f                  JSR sub_8f0d         ;             Call $8f0d [sub_8f0d] (in A, X)
87a7: 10 3c                     BPL loc_87e5         ;         End If
                                                     ;     Else
87a9: ad 9c a8  loc_87a9        LDA dat_a89c         ;         If (dat_a89c == 0)
87ac: d0 0d                     BNE loc_87bb         ;         Then
87ae: ee 8e 63                  INC CHR_638e         ;             Set
87b1: ee 8e 63                  INC CHR_638e         ;                 CHR_638e = CHR_638e + 2
87b4: a2 a3                     LDX #$a3             ;             Set
87b6: a0 06                     LDY #$06             ;                 Y/X = $a306 [StrStunFrmBlow]
87b8: 4c e2 87                  JMP loc_87e2         ;         Else If
87bb: c9 02     loc_87bb        CMP #$02             ;             (dat_a89c == 2)
87bd: d0 15                     BNE loc_87d4         ;         Then
87bf: ad 9c 63                  LDA ChrPriWeapon     ;             If (dat_a89c == 0) < 0) Then
87c2: 30 21                     BMI loc_87e5         ;                 Continue @ $87e5 [loc_87e5]   (no weapon)
                                                     ;             End If
87c4: 20 87 18                  JSR j_getItemAdr     ;             Call $1887 [j_getItemAdr]
87c7: a0 02                     LDY #$02             ;             Set Y = 2
87c9: a9 02                     LDA #$02             ;             Set A = 2
87cb: 91 41                     STA (ItemAdr_L),Y    ;             Set (*ItemAdr_L)[2] = 2
87cd: a2 a5                     LDX #$a5             ;             Set
87cf: a0 e1                     LDY #$e1             ;                 Y/X = $a5e1 [StrHrldFrmGrsp]
87d1: 4c e2 87                  JMP loc_87e2         ;         Else
87d4: 24 a5     loc_87d4        BIT dat_00a5         ;             If (dat_00a5 < 0) Then       (player is already down)
87d6: 30 0d                     BMI loc_87e5         ;                 Continue @ $87e5 [loc_87e5]
                                                     ;             End If
87d8: a9 80                     LDA #$80             ;             Set dat_00a5
87da: 05 a5                     ORA dat_00a5         ;                    =
87dc: 85 a5                     STA dat_00a5         ;                      dat_00a5 | $80
87de: a2 a3                     LDX #$a3             ;             Set
87e0: a0 2a                     LDY #$2a             ;                 Y/X = $a32a [StrURKnockdDwn]
                                                     ;         End If
87e2: 20 ce 8e  loc_87e2        JSR dsplyMsg2Secs    ;         Call $8ece [dsplyMsg2Secs]   (in Y/X)
                                                     ;     End If
                                                     ; End If
87e5: ad 0a d2  loc_87e5        LDA RANDOM           ; If (random byte >= 0)                        (50% chance)
87e8: 30 22                     BMI loc_880c         ;
87ea: a5 a7                     LDA dat_00a7_H       ;    And
87ec: 05 a8                     ORA dat_00a8_L       ;
87ee: 05 a4                     ORA dat_00a4         ;    ((dat_00a7_H | dat_00a8_L | dat_00a4) != 0)
87f0: f0 1a                     BEQ loc_880c         ;
87f2: a0 02                     LDY #$02             ;    And      (Y = 2)
87f4: b1 68                     LDA (FoeWpnAddr_L),Y ;    ((*FoeWpnAddr_L)[2] == 1)
87f6: c9 01                     CMP #$01             ;
87f8: d0 12                     BNE loc_880c         ; Then
87fa: a4 68                     LDY FoeWpnAddr_L     ;     Set
87fc: a6 69                     LDX FoeWpnAddr_H     ;         Y/X = FoeWpnAddr_L/H
87fe: 20 84 18                  JSR j_addItem        ;     Call $1884 [j_addItem]
8801: 30 09                     BMI loc_880c         ;     If (N == 0) Then
8803: a9 07                     LDA #$07             ;         Set A = 7
8805: a0 00                     LDY #$00             ;         Set Y = 0
8807: 91 41                     STA (ItemAdr_L),Y    ;         Set (*ItemAdr_L)[0] = 7
8809: 20 81 90                  JSR sub_9081         ;         Call $9081 [sub_9081]
                                                     ;     End If
                                                     ; End If
880c: 60        loc_880c        RTS                  ; Return to caller

                ;
                ;
                ;
880d: 20 6f 88  cont_880d       JSR sub_886f         ; Call $886f [sub_886f]
8810: b0 01                     BCS loc_8813         ; If (C == 0) Then
8812: 60                        RTS                  ;     Return to caller
                                                     ; End If
8813: ad 0a d2  loc_8813        LDA RANDOM           ; If
8816: c9 20                     CMP #$20             ;    (random byte >= $20 (32))
8818: 90 03                     BCC loc_881d         ; Then
881a: 4c 3c 86  loc_881a        JMP cont_863c        ;     Continue @ $863c [cont_863c]
                                                     ; End If
881d: c6 a3     loc_881d        DEC dat_00a3         ; Add 1 to dat_00a3
881f: 20 09 95                  JSR sub_9509         ; Call $9509 [sub_9509] (in FoeNum; out X, C=0)
8822: b5 b3                     LDA FoeHpTbl_L,X     ; If
8824: 0a                        ASL                  ;    ((FoeHpTbl_L[X] << 1) < FoeHp_L)
8825: cd 23 aa                  CMP FoeHp_L          ;
8828: b0 11                     BCS loc_883b         ; Then
882a: ad 22 aa                  LDA FoeHp_H          ;     Set
882d: 95 b2                     STA FoeHpTbl_H,X     ;         FoeHpTbl_H[X] = FoeHp_H
882f: ad 23 aa                  LDA FoeHp_L          ;     Set
8832: 95 b3                     STA FoeHpTbl_L,X     ;         FoeHpTbl_L[X] = FoeHp_L
8834: a2 a2                     LDX #$a2             ;     Set
8836: a0 03                     LDY #$03             ;         Y/X = $a203 [StrItDrnksPtn]
8838: 4c d1 8e                  JMP dsplyMsg4Secs    ;     Continue @ $8ed1 [dsplyMsg4Secs]   (in Y/X)
                                                     ; End If
883b: 20 fe 94  loc_883b        JSR isZoneFlag1Set   ; Call $94fe [isZoneFlag1Set] (out C = CurZoneFlags bit 1)
883e: b0 da                     BCS loc_881a         ; If (C == 0) Then
                                                     ;     Continue @ $881a [loc_881a] -> $863c [cont_863c]
                                                     ; End If
8840: a9 0b                     LDA #$0b             ; Set A = $b (11)
8842: 20 37 93                  JSR sub_9337         ; Call $9337 [sub_9337]    (TODO: Does this set C??)
8845: ad 27 aa                  LDA FoeInt           ; If
8848: 6d 0d aa                  ADC FoeLevel         ;    (FoeInt + FoeLevel > 255)
884b: b0 0a                     BCS loc_8857         ; Then
884d: a2 07                     LDX #$07             ;     Set X = 7
884f: 20 15 8f                  JSR sub_8f15         ;     Call $8f15 [sub_8f15] (in A, X)
8852: 10 03                     BPL loc_8857         ;     If (N == 0) Then
8854: 4c 67 93                  JMP cont_9367        ;         Continue @ $9367 [cont_9367]
                                                     ;     End If
                                                     ; End If
8857: e6 a4     loc_8857        INC dat_00a4         ; Add 1 to dat_00a4
8859: e6 a2                     INC dat_00a2         ; Add 2
885b: e6 a3                     INC dat_00a3         ;       to dat_00a2
885d: e6 a2                     INC dat_00a2         ; Add 2
885f: e6 a3                     INC dat_00a3         ;       to dat_00a3
8861: 4c 3c 86                  JMP cont_863c        ; Continue @ $863c [cont_863c]

                ; Randomly selects a foe weapon & continues @ $863c [cont_863c]
                ;
8864: a9 02     contRndFoeWpn   LDA #$02             ; Set A = 2
8866: 20 99 18                  JSR j_randInRange    ; Call $1899 [j_randInRange]  (in A [2], out A [0..2])
8869: 20 89 92                  JSR setFoeWeapon     ; Call $9289 [setFoeWeapon]   (in A [0..2])
886c: 4c 3c 86                  JMP cont_863c        ; Continue @ $863c [cont_863c]

                ;
                ; Input
                ;   dat_00ab  -
                ;   dat_00ac  -
                ;   Foe_aa21  -
                ;
                ; Output
                ;   C         -
                ;
886f: a5 ab     sub_886f        LDA dat_00ab         ; If
8871: 05 ac                     ORA dat_00ac         ;    ((dat_00ab | dat_00ac) == 0)
8873: d0 09                     BNE loc_887e         ;
8875: ad 21 aa                  LDA Foe_aa21         ;    And
8878: 29 a0                     AND #$a0             ;    ((Foe_aa21 & $a0) == 0)
887a: d0 02                     BNE loc_887e         ; Then
887c: 18                        CLC                  ;     Set C = 0
887d: 60                        RTS                  ;     Return to caller
                                                     ; End If
887e: 38        loc_887e        SEC                  ; Set C = 1
887f: 60                        RTS                  ; Return to caller

                ;
                ; Seems the same as cont_8898, except it may continue @ cont_880d
                ;
8880: 20 6f 88  cont_8880       JSR sub_886f         ; Call $886f [sub_886f]
8883: b0 01                     BCS loc_8886         ; If (C == 0) Then
8885: 60                        RTS                  ;     Return to caller
                                                     ; End If
8886: 20 fe 94  loc_8886        JSR isZoneFlag1Set   ; Call $94fe [isZoneFlag1Set] (out C = CurZoneFlags bit 1)
8889: b0 0a                     BCS loc_8895         ; If (C == 0)
888b: ad 0a d2                  LDA RANDOM           ;    And (random byte < $50 (80))        (80/256 = 31.25% chance)
888e: c9 50                     CMP #$50             ; Then
8890: b0 03                     BCS loc_8895         ;     Continue @ $8965 [cont_8965]
8892: 4c 65 89                  JMP cont_8965        ; End If
8895: 4c 0d 88  loc_8895        JMP cont_880d        ; Continue @ $880d [cont_880d]

                ;
                ; Seems the same as cont_8880, except it may continue @ contRndFoeWpn
                ;
8898: 20 6f 88  cont_8898       JSR sub_886f         ; Call $886f [sub_886f]
889b: b0 01                     BCS loc_889e         ; If (C == 0) Then
889d: 60                        RTS                  ;     Return to caller
                                                     ; End If
889e: 20 fe 94  loc_889e        JSR isZoneFlag1Set   ; Call $94fe  [isZoneFlag1Set] (out C = CurZoneFlags bit 1)
88a1: b0 0a                     BCS loc_88ad         ; If (C == 0)
88a3: ad 0a d2                  LDA RANDOM           ;    And
88a6: c9 50                     CMP #$50             ;    (random byte < $50 (80))           (80/256 = 31.25% chance)
88a8: b0 03                     BCS loc_88ad         ; Then
88aa: 4c 65 89                  JMP cont_8965        ;     Continue @ $8965 [cont_8965]
                                                     ; End If
88ad: 4c 64 88  loc_88ad        JMP contRndFoeWpn    ; Continue @ $8864 [contRndFoeWpn]

                ;
                ; Input
                ;   dat_a89e
                ;   dat_aa0f
                ;   FoeHp_H/L
                ;
                ;
                ; Output
                ;   C    -
                ;
88b0: ad 9e a8  sub_88b0        LDA dat_a89e         ; If
88b3: 10 03                     BPL loc_88b8         ;    (dat_a89e < 0)
88b5: 4c fc 88                  JMP loc_88fc         ; Then
88b8: ad 0f aa  loc_88b8        LDA dat_aa0f         ;     If (dat_aa0f != 0)
88bb: f0 07                     BEQ loc_88c4         ;     Then
88bd: ce 0f aa                  DEC dat_aa0f         ;         Subtract 1 from dat_aa0f
88c0: f0 02                     BEQ loc_88c4         ;         If (dat_aa0f != 0) Then
88c2: 18        contRtsC0_88c2  CLC                  ;             Set C = 0
88c3: 60                        RTS                  ;             Return to caller
                                                     ;         End If
                                                     ;     End If
88c4: 20 09 95  loc_88c4        JSR sub_9509         ;     Call $9509 [sub_9509] (in FoeNum; out X, C=0)
88c7: b5 c3                     LDA dat_00c3,X       ;     If
88c9: cd 23 aa                  CMP FoeHp_L          ;        (dat_00c3[X] == FoeHp_L)               (Z == 1, C == 1)
88cc: d0 07                     BNE loc_88d5         ;        And
88ce: b5 c2                     LDA dat_00c2,X       ;        ((dat_00c2[X] - FoeHp_H) == 0)
88d0: ed 22 aa                  SBC FoeHp_H          ;     Then
88d3: f0 ed                     BEQ contRtsC0_88c2   ;        Continue @ $88c2 [contRtsC0_88c2]
                                                     ;     End If
88d5: a5 93     loc_88d5        LDA dat_0093         ;     If (
88d7: f0 05                     BEQ loc_88de         ;          (dat_0093 != 0)
88d9: ad 0a d2                  LDA RANDOM           ;          Or (random byte >= 0)         (50% chance)
88dc: 30 07                     BMI loc_88e5         ;        )
88de: ad 0a d2  loc_88de        LDA RANDOM           ;        And (random byte >= $30)        (176/256 = 68.75% chance)
88e1: c9 30                     CMP #$30             ;     Then
88e3: b0 dd                     BCS contRtsC0_88c2   ;         Continue @ $88c2 [contRtsC0_88c2]
                                                     ;     End If
88e5: c6 a3     loc_88e5        DEC dat_00a3         ;     Subtract 1 from dat_00a3
88e7: ad 2a aa                  LDA FoeSpd           ;     Set A = FoeSpd
88ea: a2 03                     LDX #$03             ;     Set X = 3
88ec: a4 76                     LDY FoeNum           ;     Set Y = FoeNum
88ee: d0 05                     BNE loc_88f5         ;     If (Y == 0)
88f0: 24 c3                     BIT dat_00c3         ;        And (dat_00c3 & $40 != 0)
88f2: 50 01                     BVC loc_88f5         ;     Then
88f4: 4a                        LSR                  ;         Set A = A >> 1   (C = old bit 0)
                                                     ;     End If
88f5: 20 15 8f  loc_88f5        JSR sub_8f15         ;     Call $8f15 [sub_8f15] (in A, X)
88f8: 10 02                     BPL loc_88fc         ;     If (N == 0) Then
88fa: 38                        SEC                  ;         Set C = 1
88fb: 60                        RTS                  ;         Return to caller
                                                     ;     End If
                                                     ; End If
88fc: a9 02     loc_88fc        LDA #$02             ; Set
88fe: 18                        CLC                  ;     dat_00a2
88ff: 65 a2                     ADC dat_00a2         ;        =
8901: 85 a2                     STA dat_00a2         ;          dat_00a2 + 2
8903: 2c 20 aa                  BIT Foe_aa20         ; If (Foe_aa20 & $40 != 0)
8906: 70 ba                     BVS contRtsC0_88c2   ;    Or
8908: ad 21 aa                  LDA Foe_aa21         ;    ((Foe_aa21 & 8) != 0)
890b: 29 08                     AND #$08             ; Then
890d: d0 b3                     BNE contRtsC0_88c2   ;     Continue @ $88c2 [contRtsC0_88c2]
                                                     ; End If
890f: ad 20 aa                  LDA Foe_aa20         ; If
8912: 29 02                     AND #$02             ;    (Foe_aa20 & 2 != 0)
8914: f0 06                     BEQ loc_891c         ; Then
8916: a2 a4                     LDX #$a4             ;     Set
8918: a0 dc                     LDY #$dc             ;         Y/X = $a4dc [StrItFliesAway]
891a: d0 04                     BNE loc_8920         ; Else
891c: a2 a4     loc_891c        LDX #$a4             ;     Set
891e: a0 d1                     LDY #$d1             ;         Y/X = $a4d1 [StrItFlees]
                                                     ; End If
8920: 20 d1 8e  loc_8920        JSR dsplyMsg4Secs    ; Call $8ed1 [dsplyMsg4Secs]   (in Y/X)
8923: 20 09 95                  JSR sub_9509         ; Call $9509 [sub_9509] (in FoeNum; out X, C=0)
8926: a9 00                     LDA #$00             ; Set
8928: 95 b2                     STA FoeHpTbl_H,X     ;     FoeHpTbl_H[X] = 0
892a: 95 b3                     STA FoeHpTbl_L,X     ; Set FoeHpTbl_L[X] = 0
892c: c6 8a                     DEC dat_008a         ; Subtract 1 from dat_008a
892e: 20 72 90                  JSR sub_9072         ; Call $9072 [sub_9072]
8931: a5 8a                     LDA dat_008a         ; If
8933: 30 0d                     BMI loc_8942         ;    (dat_008a > 0)
8935: f0 0b                     BEQ loc_8942         ;    And
8937: ad 00 aa                  LDA FoeCount         ;    (FoeCount != 0)
893a: f0 06                     BEQ loc_8942         ; Then
893c: a6 72                     LDX dat_0072         ;     Set X = dat_0072
893e: 9a                        TXS                  ;     Set SP = dat_0072
893f: 4c 53 7a                  JMP cont_7a53        ;     Continue @ $7a53 [cont_7a53]
                                                     ; End If
8942: ad 0a d2  loc_8942        LDA RANDOM           ; If (random byte < 0)         (50% chance)
8945: 10 03                     BPL loc_894a         ; Then
8947: 20 c3 90                  JSR sub_90c3         ;     Call $90c3 [sub_90c3]
                                                     ; End If
894a: ad 9d a8  loc_894a        LDA dat_a89d         ; If (dat_a89d != 0)
894d: f0 03                     BEQ loc_8952         ; Then
894f: 20 2b 85                  JSR sub_852b         ;     Call $852b [sub_852b]
                                                     ; End If
8952: ad 59 19  loc_8952        LDA MapLocSpclType   ; If (MapLocSpclType == 0)
8955: d0 0b                     BNE loc_8962         ; Then
8957: ad 5a 19                  LDA MapLocSpclNum    ;     Set A = MapLocSpclNum
895a: a2 75                     LDX #$75             ;     Set
895c: a0 00                     LDY #$00             ;         Y/X = $7500 [EncntrDefeated]
895e: 38                        SEC                  ;     Set C = 1
895f: 20 60 18                  JSR j_updateBit      ;     Call $1860 [j_updateBit]
                                                     ; End If
8962: 4c 6d 77  loc_8962        JMP cont_776d        ; Continue @ $776d [cont_776d]

                ;
                ;
                ;
8965: 20 82 94  cont_8965       JSR sub_9482         ; Call $9482 [sub_9482]
8968: ad 0d aa                  LDA FoeLevel         ; Set
896b: 4a                        LSR                  ;     A = FoeLevel >> 1
896c: c9 0b                     CMP #$0b             ; If (A >= $b (11))
896e: 90 02                     BCC loc_8972         ; Then
8970: a9 0a                     LDA #$0a             ;     Set A = $a (10)            (clamp range to max 10)
                                                     ; End If
8972: 20 99 18  loc_8972        JSR j_randInRange    ; Call $1899 [j_randInRange]     (in A, out A [0..10])
8975: 8d 9f a8                  STA dat_a89f         ; Set dat_a89f = A
8978: 20 37 93                  JSR sub_9337         ; Call $9337 [sub_9337]
897b: ad 3c 63                  LDA ChrExpLevel      ; If
897e: 0a                        ASL                  ;    (ChrExpLevel & $80 == 0)    (player level < 128)
897f: b0 12                     BCS loc_8993         ;    And
8981: 0a                        ASL                  ;    (ChrExpLevel & $40 == 0)    (player level < 64)
8982: b0 0f                     BCS loc_8993         ;    And
8984: 6d 27 aa                  ADC FoeInt           ;    ((ChrExpLevel << 2) + FoeInt > 255)
8987: b0 0a                     BCS loc_8993         ;    And
8989: a2 06                     LDX #$06             ;       [Set X = 6 ; Call $8f15 [sub_8f15]] (in A, X)
898b: 20 15 8f                  JSR sub_8f15         ;    (N == 1)
898e: 10 03                     BPL loc_8993         ; Then
8990: 4c 67 93                  JMP cont_9367        ;     Continue @ $9367 [cont_9367]
                                                     ; End If
8993: ae 9f a8  loc_8993        LDX dat_a89f         ; Set X = dat_a89f
8996: bd aa 89                  LDA ContTbl_899f_H,X ; Push ContTbl_899f_H[X]
8999: 48                        PHA                  ;    to the stack
899a: bd 9f 89                  LDA ContTbl_899f_L,X ; Push ContTbl_899f_L[X]
899d: 48                        PHA                  ;    to the stack
899e: 60                        RTS                  ; Continue @ address on stack + 1

899f: b4 db de  ContTbl_899f_L  .BYTE $b4,$db,$de                      ; 11 bytes: LSBs of continuation addresses
89a2: ee 52 83 89 8f 95 99 a6   .BYTE $ee,$52,$83,$89,$8f,$95,$99,$a6  ;

89aa: 89 89 89  ContTbl_899f_H  .BYTE $89,$89,$89                      ; 11 bytes: MSBs of continuation addresses
89ad: 89 8a 8a 8a 8a 8a 8a 8a   .BYTE $89,$8a,$8a,$8a,$8a,$8a,$8a,$8a  ;     0: $89b5 [sub_89b5]
                                                                       ;     1: $89dc [add16ToFoeStr]
                                                                       ;     2: $89df [add16ToFoeSkl]
                                                                       ;     3: $89ef [cont_89ef]
                                                                       ;     4: $8a53 [cont_8a53]
                                                                       ;     5: $8a84 [cont_8a84]
                                                                       ;     6: $8a8a [cont_8a8a]
                                                                       ;     7: $8a90 [cont_8a90]
                                                                       ;     8: $8a96 [cont_8a96]
                                                                       ;     9: $8a9a [cont_8a9a]
                                                                       ;    10: $8aa7 [cont_8aa7]

                ;
                ;
                ;
89b5: a2 0a     sub_89b5        LDX #$0a             ; Set X = $a (11 iterations [10..0])
89b7: bd 37 aa  loc_89b7        LDA FoeProt,X        ; Loop
89ba: f0 13                     BEQ loc_89cf         ;     If (FoeProt[X] != 0) Then
89bc: c9 81                     CMP #$81             ;         If (FoeProt[X] < $81 (129))
89be: b0 18                     BCS loc_89d8         ;            And
89c0: c9 10                     CMP #$10             ;            (FoeProt[X] >= $10 (16))
89c2: 90 14                     BCC loc_89d8         ;         Then
89c4: 29 f0                     AND #$f0             ;             If ((FoeProt[X] & $f0) == 0)
89c6: d0 07                     BNE loc_89cf         ;             Then
89c8: a9 00                     LDA #$00             ;                 Set
89ca: 9d 37 aa                  STA FoeProt,X        ;                     FoeProt[X] = 0
89cd: f0 09                     BEQ loc_89d8         ;             Else                               (jumps to $89cf)
                                                     ;                 Set FoeProt[X] = FoeProt[X] + $11 (17)
                                                     ;             End If
                                                     ;         End If
                                                     ;     Else
89cf: 18        loc_89cf        CLC                  ;         Set
89d0: a9 11                     LDA #$11             ;             FoeProt[X]
89d2: 7d 37 aa                  ADC FoeProt,X        ;                =
89d5: 9d 37 aa                  STA FoeProt,X        ;                  FoeProt[X] + $11 (17)
                                                     ;     End If
89d8: ca        loc_89d8        DEX                  ;     Subtract 1 from X
89d9: 10 dc                     BPL loc_89b7         ; Repeat while (X >= 0)
89db: 60                        RTS                  ; Return to caller

                ; Adds 16 to FoeStr up to a max of $ff
                ;
89dc: a2 02     add16ToFoeStr   LDX #$02             ; Set X = 2    (2 = FoeStr)
89de: 2c        nop_89de        .BYTE $2c            ; Forms `BIT $05a2` (NOP) with `LDX #$05` in next 2 bytes


                ; Adds 16 to FoeSkl up to a max of $ff
                ;
89df: a2 05     add16ToFoeSkl   LDX #$05             ; Set X = 5  (FoeSkl or X = 2 (FoeStr) if called via add16ToFoeStr)
89e1: 18                        CLC                  ; Set A
89e2: bd 24 aa                  LDA FoeStats,X       ;       =
89e5: 69 10                     ADC #$10             ;         FoeStats[X] + $10 (16)
89e7: 90 02                     BCC loc_89eb         ; If (C == 1) Then
89e9: a9 ff                     LDA #$ff             ;     Set A = $ff
                                                     ; End If
89eb: 9d 24 aa  loc_89eb        STA FoeStats,X       ; FoeStats[X] = A
89ee: 60                        RTS                  ; Return to caller

                ;
                ;
                ;
89ef: a9 03     cont_89ef       LDA #$03             ; Set
89f1: 85 88                     STA DiceSides        ;     DiceSides = 3
89f3: ad 0d aa                  LDA FoeLevel         ; Set DiceCount
89f6: 4a                        LSR                  ;        =
89f7: 85 87                     STA DiceCount        ;          (FoeLevel >> 1)
89f9: e6 87                     INC DiceCount        ;            + 1
89fb: 20 aa 8f                  JSR rollDice         ; Call $8faa [rollDice]
89fe: 8d de 63                  STA Chr_SharpDmg     ; Set Chr_SharpDmg = A
8a01: a9 01     loc_8a01        LDA #$01             ; Set
8a03: 8d 9c a8                  STA dat_a89c         ;     dat_a89c = 1
8a06: 20 8d 93                  JSR calcFoeAtkDmg    ; Call $938d [calcFoeAtkDmg]
8a09: 20 8f 8e                  JSR sub_8e8f         ; Call $8e8f [sub_8e8f]
8a0c: 20 75 94                  JSR sub_9475         ; Call $9475 [sub_9475]
8a0f: 30 0a                     BMI loc_8a1b         ; If (N == 0) Then                          (half the damage)
8a11: d0 04                     BNE loc_8a17         ;     If (Z == 1) Then                      (quarter the damage)
8a13: 46 a7                     LSR dat_00a7_H       ;         Set dat_00a7_H = dat_00a7_H >> 1    (C = old bit 0)
8a15: 66 a8                     ROR dat_00a8_L       ;         Set dat_00a8_L = (dat_00a8_L >> 1) | (C << 7)
                                                     ;     End If
8a17: 46 a7     loc_8a17        LSR dat_00a7_H       ;     Set dat_00a7_H = dat_00a7_H >> 1        (C = old bit 0)
8a19: 66 a8                     ROR dat_00a8_L       ;     Set dat_00a8_L = (dat_00a8_L >> 1) | (C << 7)
                                                     ; End If
8a1b: 38        loc_8a1b        SEC                  ; Set
8a1c: ad 46 63                  LDA ChrHp_L          ;     ChrHp_L
8a1f: e5 a8                     SBC dat_00a8_L       ;        =
8a21: 8d 46 63                  STA ChrHp_L          ;          ChrHp_L - dat_00a8_L       (C = 0 on underflow else 1)
8a24: ad 45 63                  LDA ChrHp_H          ; Set ChrHp_H
8a27: e5 a7                     SBC dat_00a7_H       ;        =
8a29: 8d 45 63                  STA ChrHp_H          ;          ChrHp_H - dat_00a7_H - ~C
8a2c: b0 08                     BCS loc_8a36         ; If (C == 0) Then   (underflow - player died)
8a2e: a9 00                     LDA #$00             ;     Set
8a30: 8d 45 63                  STA ChrHp_H          ;         ChrHp_H = 0
8a33: 8d 46 63                  STA ChrHp_L          ;     Set ChrHp_L = 0
                                                     ; End If
8a36: a2 00     loc_8a36        LDX #$00             ; Set X = 0                    (0: Repel)
8a38: a5 78                     LDA dat_0078         ; If (dat_0078 != 0) Then
8a3a: f0 04                     BEQ loc_8a40         ;     Add 1 to X               (1: Resist)
8a3c: 10 01                     BPL loc_8a3f         ;     If (dat_0078 < 0) Then
8a3e: e8                        INX                  ;         Add 1 to X           (2: Fail to resist)
8a3f: e8        loc_8a3f        INX                  ;     End If
                                                     ; End If
8a40: bd db a5  loc_8a40        LDA ResistDesc_L,X   ; Set
8a43: 8d d9 76                  STA GrbItemName_L    ;     GrbItemName_L/H
8a46: bd de a5                  LDA ResistDesc_H,X   ;     to
8a49: 8d da 76                  STA GrbItemName_H    ;     ResistDesc_L/H[X]    (0: Repel; 1: Resist; 2: Fail to resist)
8a4c: a2 a5                     LDX #$a5             ; Set
8a4e: a0 8a                     LDY #$8a             ;     Y/X = $a58a [StrYouTheSpell]
8a50: 4c d1 8e                  JMP dsplyMsg4Secs    ; Continue @ $8ed1 [dsplyMsg4Secs]   (in Y/X)

                ;
                ;
                ;
8a53: a9 03     cont_8a53       LDA #$03             ; Set
8a55: 85 a7                     STA dat_00a7_H       ;     dat_00a7_H = 3
8a57: 20 75 94                  JSR sub_9475         ; Call $9475 [sub_9475]
8a5a: a2 02                     LDX #$02             ; Set X = 2
8a5c: a5 78                     LDA dat_0078         ; If (dat_0078 >= 0)
8a5e: 30 08                     BMI loc_8a68         ; Then
8a60: d0 03                     BNE loc_8a65         ;     If (dat_0078 == 0) Then
8a62: ca                        DEX                  ;         Subtract 1 from X
8a63: 46 a7                     LSR dat_00a7_H       ;         Set dat_00a7_H = dat_00a7_H >> 1
                                                     ;     End If
8a65: 46 a7     loc_8a65        LSR dat_00a7_H       ;     Set dat_00a7_H = dat_00a7_H >> 1
8a67: ca                        DEX                  ;     Subtract 1 from X
                                                     ; End If
8a68: 18        loc_8a68        CLC                  ; Set
8a69: ad 8e 63                  LDA CHR_638e         ;     CHR_638e
8a6c: 65 a7                     ADC dat_00a7_H       ;        =
8a6e: 8d 8e 63                  STA CHR_638e         ;          CHR_638e + dat_00a7_H
8a71: bd db a5                  LDA ResistDesc_L,X   ; Set
8a74: 8d d9 76                  STA GrbItemName_L    ;     GrbItemName_L/H
8a77: bd de a5                  LDA ResistDesc_H,X   ;     to
8a7a: 8d da 76                  STA GrbItemName_H    ;     ResistDesc_L/H[X]
8a7d: a2 a6                     LDX #$a6             ; Set
8a7f: a0 0c                     LDY #$0c             ;     Y/X = $a60c [StrItsPower]
8a81: 4c ce 8e                  JMP dsplyMsg2Secs    ; Continue @ $8ece [dsplyMsg2Secs]   (in Y/X)

                ;
                ;
                ;
8a84: a2 04     cont_8a84       LDX #$04             ; Set X = 4
8a86: a9 46                     LDA #$46             ; Set A = $46 (70)
8a88: d0 14                     BNE loc_8a9e         ; Continue @ $8a9e [loc_8a9e]

                ;
                ;
                ;
8a8a: a2 0a     cont_8a8a       LDX #$0a             ; Set X = $a (10)
8a8c: a9 46                     LDA #$46             ; Set A = $46 (70)
8a8e: d0 0e                     BNE loc_8a9e         ; Continue @ $8a9e [loc_8a9e]

                ;
                ;
                ;
8a90: a2 06     cont_8a90       LDX #$06             ; Set X = 6
8a92: a9 28                     LDA #$28             ; Set A = $28 (40)
8a94: d0 08                     BNE loc_8a9e         ; Continue @ $8a9e [loc_8a9e]

                ;
                ;
                ;
8a96: a2 07     cont_8a96       LDX #$07             ; Set X = 7
8a98: a9 46                     LDA #$46             ; Set A = $46 (70)
                                                     ; (Buggy? X & A overwritten below, so this path is no different
                                                     ;  than calling cont_8a9a directly. Likely missing a `BNE loc_8a9e`
                                                     ;  here)

                ;
                ;
                ;
8a9a: a2 03     cont_8a9a       LDX #$03             ; Set X = 3
8a9c: a9 46                     LDA #$46             ; Set A = $46 (4d6)
8a9e: 20 8e 8f  loc_8a9e        JSR rollDiceA        ; Call $8f8e [rollDiceA] (in A; out A; X, Y unchanged)
8aa1: 9d dd 63                  STA Chr_BluntDmg,X   ; Set Chr_BluntDmg[3] = A
8aa4: 4c 01 8a                  JMP loc_8a01         ; Continue @ $8a01 [loc_8a01]

                ;
                ;
                ;
8aa7: ad 9c 63  cont_8aa7       LDA ChrPriWeapon     ; Set A = ChrPriWeapon
8aaa: 30 12                     BMI loc_8abe         ; If (A >= 0) Then
8aac: 20 87 18                  JSR j_getItemAdr     ;     Call $1887 [j_getItemAdr]  (in A)
8aaf: f0 0d                     BEQ loc_8abe         ;     If (Z == 0) Then
8ab1: a0 02                     LDY #$02             ;         Set Y = 2
8ab3: a9 02                     LDA #$02             ;         Set
8ab5: 91 41                     STA (ItemAdr_L),Y    ;             (*ItemAdr_L)[2] = 2
8ab7: a2 a5                     LDX #$a5             ;         Set
8ab9: a0 e1                     LDY #$e1             ;             Y/X = $a5e1 [StrHrldFrmGrsp]
8abb: 20 7f 8e                  JSR shwMsgAndUpdt    ;         Call $8e7f [shwMsgAndUpdt] (in Y/X)
                                                     ;     End If
                                                     ; End If
8abe: 60        loc_8abe        RTS                  ; Return to caller

                ;
                ;
                ;
8abf: ba        cont_8abf       TSX                  ; Set
8ac0: 86 73                     STX dat_0073         ;     dat_0073 = SP
8ac2: a9 ff     contTrnsctMenu  LDA #$ff             ; Loop
                                                     ;     Set
8ac4: 8d 61 19                  STA dat_1961         ;         dat_1961 = $ff
8ac7: a2 9a                     LDX #$9a             ;     Set
8ac9: a0 cf                     LDY #$cf             ;         Y/X = $9acf [StrTrnsctOptns]
8acb: 20 ef 8e                  JSR dsplyTmpltStr    ;     Call $8eef [dsplyTmpltStr] (in Y/X)
8ace: a9 05                     LDA #$05             ;     Set A = 5
8ad0: 20 1c 90                  JSR getMenuSel       ;     Call $901c [getMenuSel]  (in A, out MenuSel [0..4])
8ad3: a5 74                     LDA MenuSel          ;     Set
8ad5: 85 75                     STA dat_0075         ;         dat_0075 = MenuSel
8ad7: c9 05                     CMP #$05             ; Repeat
8ad9: b0 e7                     BCS contTrnsctMenu   ;    while (MenuSel >= 5)
8adb: c9 01                     CMP #$01             ; If
8add: f0 03                     BEQ loc_8ae2         ;    (MenuSel == 1)                     (1 = Offer)
8adf: 4c 0c 8b                  JMP loc_8b0c         ; Then
8ae2: a2 0f     loc_8ae2        LDX #$0f             ;     Set X = 15    (16 iterations [15..0])
8ae4: bd 94 64  loc_8ae4        LDA DroppedGame,X    ;     Loop
8ae7: 29 7f                     AND #$7f             ;         Set
8ae9: 9d 94 64                  STA DroppedGame,X    ;             DroppedGame[X] = DroppedGame[X] & $7f
8aec: ca                        DEX                  ;         Subtract 1 from X
8aed: 10 f5                     BPL loc_8ae4         ;     Repeat while (X >= 0)
8aef: a2 98                     LDX #$98             ;     Set
8af1: a0 81                     LDY #$81             ;         Y/X = $9881 [StrClearRows]
8af3: 20 ef 8e                  JSR dsplyTmpltStr    ;     Call $8eef [dsplyTmpltStr] (in Y/X)
8af6: 20 9f 18                  JSR j_startOffer     ;     Call $189f [j_startOffer]
8af9: 20 f9 8e                  JSR applyUpdates     ;     Call $8ef9 [applyUpdates]
8afc: 2c 61 19                  BIT dat_1961         ;     If (dat_1961 < 0) Then
8aff: 10 03                     BPL loc_8b04         ;        Continue @ $8ac2 [contTrnsctMenu]
8b01: 4c c2 8a                  JMP contTrnsctMenu   ;     End If
8b04: 20 0f 8c  loc_8b04        JSR sub_8c0f         ;     Call $8c0f [sub_8c0f]
8b07: 90 03                     BCC loc_8b0c         ;     If (C == 1) Then
8b09: 4c 1c 8b                  JMP loc_8b1c         ;         Continue @ $8b1c [loc_8b1c]
                                                     ;     End If
                                                     ; End If
8b0c: a5 75     loc_8b0c        LDA dat_0075         ; If (dat_0075 == 0)                    (0 = Leave)
8b0e: d0 0b                     BNE loc_8b1b         ; Then
8b10: ad 21 aa                  LDA Foe_aa21         ;     If
8b13: 29 10                     AND #$10             ;        ((Foe_aa21 & $10) != 0)
8b15: f0 01                     BEQ loc_8b18         ;     Then
8b17: 60                        RTS                  ;         Return to caller
                                                     ;     Else
8b18: 4c b8 8c  loc_8b18        JMP loc_8cb8         ;         Continue @ $8cb8 [loc_8cb8] -> $849d [cont_849d]
                                                     ;     End If
                                                     ; End If
8b1b: 18        loc_8b1b        CLC                  ; Set C = 0
8b1c: ae 17 aa  loc_8b1c        LDX dat_aa17_L       ; Set X = dat_aa17_L
8b1f: ad 18 aa                  LDA dat_aa17_H       ; Set A = dat_aa17_H
8b22: f0 03                     BEQ loc_8b27         ; If (A != 0) Then
8b24: 4c e7 94                  JMP contAtAddrXA     ;     Continue @ $94e7 [contAtAddrXA] (in X/A)
                                                     ; End If
8b27: bd 37 8b  loc_8b27        LDA ContTbl_8b30_H,X ; Push ContTbl_8b30_H[X]
8b2a: 48                        PHA                  ;     to the stack
8b2b: bd 30 8b                  LDA ContTbl_8b30_L,X ; Push ContTbl_8b30_L[X]
8b2e: 48                        PHA                  ;     to the stack
8b2f: 60                        RTS                  ; Continue @ address on stack + 1

8b30: 7f 8e b2  ContTbl_8b30_L  .BYTE $7f,$8e,$b2      ; 7 bytes: LSBs of continuation addresses
8b33: f3 7f 30 5a               .BYTE $f3,$7f,$30,$5a  ;

8b37: 8b 8b 8b  ContTbl_8b30_H  .BYTE $8b,$8b,$8b      ; 7 bytes: MSBs of continuation addresses
8b3a: 8b 8b 8d 8d               .BYTE $8b,$8b,$8d,$8d  ;    0: $8b80 [cont_8b80]        4: $8b80 [cont_8b80]
                                                       ;    1: $8b8f [cont_8b8f]        5: $8d31 [cont_8d31]
                                                       ;    2: $8bb3 [cont_8bb3]        6: $8d5b [cont_8d5b]
                                                       ;    3: $8bf4 [cont_8bf4]

                ;
                ;
                ; Output
                ;   C     -
                ;   A     -
                ;   Z     -
                ;   N     -
                ;
                ;
8b3e: a5 80     sub_8b3e        LDA dat_0080         ; If
8b40: c5 9c                     CMP dat_009c         ;    (dat_0080 == dat_009c)
8b42: d0 3a                     BNE rtsC0_8b7e       ; Then
8b44: a5 80                     LDA dat_0080         ;     If (dat_0080 != 0)
8b46: f0 10                     BEQ loc_8b58         ;     Then
8b48: c9 07                     CMP #$07             ;         If (dat_0080 != 7) Then
8b4a: d0 2c                     BNE rtsC1_8b78       ;             Continue @ $8b78 [rtsC1_8b78]
8b4c: a5 81                     LDA dat_0081         ;         Else If (dat_0081 ? $ff)
8b4e: c9 ff                     CMP #$ff             ;         Then
8b50: f0 28                     BEQ rtsC0_8b7a       ;             Continue @ $8b7a [rtsC0_8b7a]
8b52: c5 9d                     CMP dat_009d         ;         Else If (dat_0081 == dat_009d) Then
8b54: f0 22                     BEQ rtsC1_8b78       ;             Continue @ $8b78 [rtsC1_8b78]
                                                     ;         Else
8b56: d0 22                     BNE rtsC0_8b7a       ;             Continue @ $8b7a [rtsC0_8b7a]
                                                     ;         End If
                                                     ;     End If
8b58: a5 81     loc_8b58        LDA dat_0081         ;     Set A = dat_0081
8b5a: c9 09                     CMP #$09             ;     If (A >= 9)
8b5c: 90 02                     BCC loc_8b60         ;     Then
8b5e: a9 0b                     LDA #$0b             ;         Set A = $b (11)
                                                     ;     End If
8b60: c5 9d     loc_8b60        CMP dat_009d         ;     If (A == dat_009d)
8b62: d0 1a                     BNE rtsC0_8b7e       ;     Then
8b64: a5 82                     LDA dat_0082         ;         If
8b66: c5 9e                     CMP dat_009e         ;            (dat_0082 >= dat_009e)
8b68: 90 0a                     BCC loc_8b74         ;         Then
8b6a: f0 02                     BEQ loc_8b6e         ;             If (dat_0082 != 0)
8b6c: b0 0a                     BCS rtsC1_8b78       ;                Or
8b6e: a5 83     loc_8b6e        LDA dat_0083         ;                (dat_0083 >= dat_009e)
8b70: c5 9e                     CMP dat_009e         ;             Then
8b72: b0 04                     BCS rtsC1_8b78       ;                 Continue @ $8b78 [rtsC1_8b78]
                                                     ;             End If
                                                     ;         End If
8b74: a9 00     loc_8b74        LDA #$00             ;         Set A = 0     (also sets Z == 1, N == 0)
8b76: 18                        CLC                  ;         Set C = 0
8b77: 60                        RTS                  ;         Return to caller

8b78: 38        rtsC1_8b78      SEC                  ;         Set C = 1
8b79: 60                        RTS                  ;         Return to caller

8b7a: a5 80     rtsC0_8b7a      LDA dat_0080         ;         Set A = dat_0080
8b7c: c5 9c                     CMP dat_009c         ;         Set N = (dat_0080 < dat_009c)
                                                     ;         Set Z = (dat_0080 == dat_009c)

                                                     ;     End If
                                                     ; End If

8b7e: 18        rtsC0_8b7e      CLC                  ; Set C = 0
8b7f: 60                        RTS                  ; Return to caller

                ;
                ;
                ;
8b80: 20 6e 8d  cont_8b80       JSR sub_8d6e         ; Call $8d6e [sub_8d6e]
8b83: ad 21 aa                  LDA Foe_aa21         ; Set Foe_aa21
8b86: 09 20                     ORA #$20             ;        =
8b88: 8d 21 aa                  STA Foe_aa21         ;          Foe_aa21 | $20
8b8b: a6 73                     LDX dat_0073         ; Set X = dat_0073
8b8d: 9a                        TXS                  ; Set SP = dat_0073
8b8e: 60                        RTS                  ; Return to address on stack + 1

                ;
                ;
                ;
8b8f: b0 03     cont_8b8f       BCS loc_8b94         ; If (C == 1)
8b91: 4c b2 8b  loc_8b91        JMP loc_8bb2         ; Then
8b94: a9 12     loc_8b94        LDA #$12             ;     Set A = $12 (1d2)
8b96: 20 8e 8f                  JSR rollDiceA        ;     Call $8f83 [rollDiceA] (in A; out A; X, Y unchanged)
8b99: 85 9f                     STA dat_009f         ;     Set dat_009f = A
8b9b: a9 00                     LDA #$00             ;     Set
8b9d: 85 9e                     STA dat_009e         ;         dat_009e = 0
8b9f: a9 00                     LDA #$00             ;     Set
8ba1: 85 9c                     STA dat_009c         ;         dat_009c = 0
8ba3: 85 9d                     STA dat_009d         ;     Set dat_009d = 0
8ba5: 20 3e 8b                  JSR sub_8b3e         ;     Call $8b3e [sub_8b3e]
8ba8: 90 03                     BCC loc_8bad         ;     If (C == 1) Then
8baa: 4c bb 8c                  JMP cont_8cbb        ;         Continue @ $8cbb [cont_8cbb]
8bad: f0 03     loc_8bad        BEQ loc_8bb2         ;     Else If (Z == 0) Then
8baf: 4c 80 8b                  JMP cont_8b80        ;         Continue @ $8b80 [cont_8b80]
                                                     ;     End If
                                                     ; End If
8bb2: 60        loc_8bb2        RTS                  ; Returnn to caller

                ;
                ;
                ;
8bb3: b0 06     cont_8bb3       BCS loc_8bbb         ; If (C == 0) Then
8bb5: 20 cb 8c                  JSR sub_8ccb         ;     Call $8ccb [sub_8ccb]
8bb8: 4c 80 8b                  JMP cont_8b80        ;     Continue @ $8b80 [cont_8b80]
8bbb: ad 87 63  loc_8bbb        LDA CHR_Unk_6387     ; Else If (CHR_Unk_6387 < 0)
8bbe: 10 03                     BPL loc_8bc3         ; Then
8bc0: 4c 80 8b                  JMP cont_8b80        ;     Continue @ $8b80 [cont_8b80]
8bc3: c9 10     loc_8bc3        CMP #$10             ; Else If (CHR_Unk_6387 >= $10 (16))
8bc5: 90 03                     BCC loc_8bca         ; Then
8bc7: 4c 80 8b                  JMP cont_8b80        ;     Continue @ $8b80 [cont_8b80]
                                                     ; End If
8bca: a2 00     loc_8bca        LDX #$00             ; Set
8bcc: 86 9e                     STX dat_009e         ;     dat_009e = 0
8bce: 85 9f                     STA dat_009f         ; Set
8bd0: 18                        CLC                  ;     dat_009f
8bd1: 6d 3c 63                  ADC ChrExpLevel      ;        =
8bd4: 85 9f                     STA dat_009f         ;          CHR_Unk_6387 + ChrExpLevel
8bd6: 90 02                     BCC loc_8bda         ; If (C == 1) Then
8bd8: e6 9e                     INC dat_009e         ;     Add 1 to dat_009e
                                                     ; End If
8bda: a2 04     loc_8bda        LDX #$04             ; Set X = 4
8bdc: 06 9f     loc_8bdc        ASL dat_009f         ; Loop
                                                     ;     Set dat_009f = dat_009f << 1           (C = old bit 7)
8bde: 26 9e                     ROL dat_009e         ;     Set dat_009e = (dat_009e << 1) | C     (C = old bit 7)
8be0: ca                        DEX                  ;     Subtract 1 from X
8be1: d0 f9                     BNE loc_8bdc         ; Repeat while (C != 0)
8be3: a9 00                     LDA #$00             ; Set
8be5: 85 9c                     STA dat_009c         ;     dat_009c = 0
8be7: a9 0b                     LDA #$0b             ; Set
8be9: 85 9d                     STA dat_009d         ;     dat_009d = $0b (11)
8beb: 20 3e 8b                  JSR sub_8b3e         ; Call $8b3e [sub_8b3e]
8bee: 90 03                     BCC loc_8bf3         ; If (C == 1) Then
8bf0: 4c bb 8c                  JMP cont_8cbb        ;     Continue @ $8cbb [cont_8cbb]
                                                     ; End If
8bf3: 60        loc_8bf3        RTS                  ; Return to caller

                ;
                ;
                ;
8bf4: 20 cb 8c  cont_8bf4       JSR sub_8ccb         ; Call $8ccb [sub_8ccb]
8bf7: 90 13                     BCC loc_8c0c         ; If (C == 1) Then
8bf9: a9 07                     LDA #$07             ;     Set
8bfb: 85 9c                     STA dat_009c         ;         dat_009c = 7
8bfd: 20 3e 8b                  JSR sub_8b3e         ;     Call $8b3e [sub_8b3e]
8c00: d0 0a                     BNE loc_8c0c         ;     If (Z == 1) Then
8c02: a2 85                     LDX #$85             ;         Set X = $85  ($6385 [ChrAlign])
8c04: a9 01                     LDA #$01             ;         Set A = 1
8c06: 20 6f 18                  JSR j_decChrAttr8    ;         Call $186f [j_decChrAttr8]
8c09: 4c bb 8c                  JMP cont_8cbb        ;         Continue @ $8cbb [cont_8cbb]
                                                     ;     End If
                                                     ; End If
8c0c: 4c 80 8b  loc_8c0c        JMP cont_8b80        ; Continue @ $8b80 [cont_8b80]

                ;
                ; Output
                ;   C     -
                ;
8c0f: a2 0f     sub_8c0f        LDX #$0f             ; Set X = $0f (15)
8c11: bd 94 64  loc_8c11        LDA DroppedGame,X    ; Loop
                                                     ;     If
8c14: c9 02                     CMP #$02             ;        (DroppedGame[X] == 2)               (2 = Dungeon)
8c16: d0 18                     BNE loc_8c30         ;
8c18: bd a4 64                  LDA DroppedX,X       ;        Or
8c1b: cd 13 63                  CMP CHR_LOC_X        ;        (DroppedX[X] == CHR_LOC_X)
8c1e: d0 10                     BNE loc_8c30         ;
8c20: bd b4 64                  LDA DroppedY,X       ;        Or
8c23: cd 14 63                  CMP CHR_LOC_Y        ;        (DroppedY[X] == CHR_LOC_Y)
8c26: d0 08                     BNE loc_8c30         ;
8c28: bd c4 64                  LDA DroppedMap,X     ;        Or
8c2b: cd 15 63                  CMP CHR_LOC_MAP      ;        (DroppedMap[X] == CHR_LOC_MAP)
8c2e: f0 05                     BEQ loc_8c35         ;     Then
                                                     ;         Exit Loop                          (found a match)
                                                     ;     End If
8c30: ca        loc_8c30        DEX                  ;     Subtract 1 from X
8c31: 10 de                     BPL loc_8c11         ; Repeat while (X >= 0)
                                                     ; If (X < 0) Then                            (no match found)
8c33: 18        loc_8c33        CLC                  ;     Set C = 0
8c34: 60                        RTS                  ;     Return to caller
                                                     ; End If
8c35: bd d4 64  loc_8c35        LDA DroppedItmIdx,X  ; Set
8c38: 85 4b                     STA ItemIndex        ;     ItemIndex = DroppedItmIdx[X]
8c3a: 85 7f                     STA dat_007f         ; Set dat_007f = DroppedItmIdx[X]
8c3c: 20 87 18                  JSR j_getItemAdr     ; Call $1887 [j_getItemAdr]
8c3f: f0 f2                     BEQ loc_8c33         ; If (Z == 0) Then                           (slot empty)
                                                     ;     Set C = 0
                                                     ;     Return to caller
                                                     ; End If
8c41: a0 00                     LDY #$00             ; Set Y = 0
8c43: b1 41                     LDA (ItemAdr_L),Y    ; Set
8c45: 85 80                     STA dat_0080         ;     dat_0080 = (*ItemAdr_L)[0]             (item type)
8c47: d0 51                     BNE loc_8c9a         ; If (dat_0080 == 0) Then
8c49: 20 96 18                  JSR j_getItemAttrs   ;     Call $1896 [j_getItemAttrs]
8c4c: a0 00                     LDY #$00             ;     Set Y = 0
8c4e: b1 43                     LDA (ItemAttrs_L),Y  ;     Set
8c50: 85 81                     STA dat_0081         ;         dat_0081 = (*ItemAttrs_L)[0]
8c52: c8                        INY                  ;     Add 1 to Y    (Y = 1)
8c53: b1 43                     LDA (ItemAttrs_L),Y  ;     Set
8c55: 85 82                     STA dat_0082         ;         dat_0082 = (*ItemAttrs_L)[1]
8c57: 85 09                     STA DestAdr_L        ;     Set DestAdr_L = (*ItemAttrs_L)[1]
8c59: c8                        INY                  ;     Add 1 to Y    (Y = 2)
8c5a: b1 43                     LDA (ItemAttrs_L),Y  ;     Set
8c5c: 85 83                     STA dat_0083         ;         dat_0083 = (*ItemAttrs_L)[2]
8c5e: 85 0a                     STA DestAdr_H        ;     Set DestAdr_H = (*ItemAttrs_L)[2]
8c60: a2 02                     LDX #$02             ;     Set X = 2
8c62: 38                        SEC                  ;     Set A
8c63: a5 81                     LDA dat_0081         ;           =
8c65: e9 09                     SBC #$09             ;             (dat_0081 - 9)
8c67: f0 07                     BEQ loc_8c70         ;     If (A != 0) Then
8c69: 90 2c                     BCC loc_8c97         ;         If (A < 0) Then
                                                     ;             Continue @ $8c97 [loc_8c97] -> $8cb6 [loc_8cb6]
                                                     ;         End If
8c6b: c9 02                     CMP #$02             ;         If (A == 2) Then
8c6d: f0 28                     BEQ loc_8c97         ;             Continue @ $8c97 [loc_8c97] -> $8cb6 [loc_8cb6]
                                                     ;         End If
8c6f: ca                        DEX                  ;         Subtract 1 from X   (X = 1)
                                                     ;     End If
8c70: a5 82     loc_8c70        LDA dat_0082         ;     Loop
8c72: c9 19                     CMP #$19             ;         If (dat_0082 >= $19 (25))
8c74: 90 08                     BCC loc_8c7e         ;         Then
8c76: a9 ff                     LDA #$ff             ;             Set
8c78: 85 82                     STA dat_0082         ;                 dat_0082 = $ff
8c7a: 85 83                     STA dat_0083         ;             Set dat_0083 = $ff
8c7c: 30 19                     BMI loc_8c97         ;             Continue @ $8c97 [loc_8c97] -> $8cb6 [loc_8cb6]
                                                     ;         End If
8c7e: a0 03     loc_8c7e        LDY #$03             ;         Set Y = 3    (3 iterations [3..1])
8c80: 06 0a     loc_8c80        ASL DestAdr_H        ;         Loop
                                                     ;             Set DestAdr_H = DestAdr_H << 1        (C = old bit 7)
8c82: 26 09                     ROL DestAdr_L        ;             Set DestAdr_L = (DestAdr_L << 1) | C
8c84: 88                        DEY                  ;             Subtract 1 from Y
8c85: d0 f9                     BNE loc_8c80         ;         Repeat while (Y != 0)
8c87: 18                        CLC                  ;         Set
8c88: a5 0a                     LDA DestAdr_H        ;             dat_0083
8c8a: 65 83                     ADC dat_0083         ;                =
8c8c: 85 83                     STA dat_0083         ;                  dat_0083 + DestAdr_H  (C = 1 on overflow else 0)
8c8e: a5 09                     LDA DestAdr_L        ;         Set dat_0082
8c90: 65 82                     ADC dat_0082         ;                =
8c92: 85 82                     STA dat_0082         ;                  dat_0082 + DestAdr_L + C
8c94: ca                        DEX                  ;         Subtract 1 from X
8c95: d0 d9                     BNE loc_8c70         ;     Repeat while (X != 0)
8c97: 4c b6 8c  loc_8c97        JMP loc_8cb6         ; Else If
8c9a: c9 07     loc_8c9a        CMP #$07             ;    (dat_0080 == 7)
8c9c: d0 18                     BNE loc_8cb6         ; Then
8c9e: a9 ff                     LDA #$ff             ;     Set
8ca0: 85 81                     STA dat_0081         ;         dat_0081 = $ff
8ca2: 20 96 18                  JSR j_getItemAttrs   ;     Call $1896 [j_getItemAttrs]
8ca5: a0 00                     LDY #$00             ;     Set Y = 0
8ca7: b1 43                     LDA (ItemAttrs_L),Y  ;     If
8ca9: c9 02                     CMP #$02             ;        ((*ItemAttrs_L)[0] == 2)
8cab: d0 09                     BNE loc_8cb6         ;     Then
8cad: c8                        INY                  ;         Add 1 to Y    (Y = 1)
8cae: b1 43                     LDA (ItemAttrs_L),Y  ;         If
8cb0: c9 00                     CMP #$00             ;            ((*ItemAttrs_L)[1] == 0)
8cb2: d0 02                     BNE loc_8cb6         ;         Then
8cb4: 85 81                     STA dat_0081         ;             Set dat_0081 = (*ItemAttrs_L)[1]
                                                     ;         End If
                                                     ;     End If
                                                     ; End If
8cb6: 38        loc_8cb6        SEC                  ; Set C = 1
8cb7: 60                        RTS                  ; Return to caller

                ;
                ;
                ;
8cb8: 4c 9d 84  loc_8cb8        JMP cont_849d        ; Continue @ $849d [cont_849d]

                ;
                ;
                ;
8cbb: 20 cd 90  cont_8cbb       JSR rmveAllDropped   ; Call $90cd [rmveAllDropped]
8cbe: 20 67 90                  JSR clrSmthngHere    ; Call $9067 [clrSmthngHere]
8cc1: a2 a1                     LDX #$a1             ; Set
8cc3: a0 0f                     LDY #$0f             ;     Y/X = $a10f [StrTakesOfr]
8cc5: 20 d1 8e                  JSR dsplyMsg4Secs    ; Call $8ed1 [dsplyMsg4Secs]   (in Y/X)
8cc8: 4c 6d 77                  JMP cont_776d        ; Continue @ $776d [cont_776d]

                ; Seems related to transact / hail?
                ;
                ; Input
                ;   dat_0062   - a player attribute offset?
                ;   dat_0075   - a menu selection index?
                ;   FoeInt     - Foe intelligence stat
                ;   ChrIntCalc -
                ;   ChrChrCalc -
                ;   Dapperness -
                ;
                ; Output
                ;   dat_0097   -
                ;
8ccb: a5 75     sub_8ccb        LDA dat_0075         ; If
8ccd: c9 03                     CMP #$03             ;    (dat_0075 != 3)
8ccf: f0 33                     BEQ loc_8d04         ; Then
8cd1: a5 75                     LDA dat_0075         ;    If
8cd3: c9 02                     CMP #$02             ;       (dat_0075 != 2)
8cd5: f0 01                     BEQ loc_8cd8         ;     Then
8cd7: 60                        RTS                  ;        Return to caller
                                                     ;     End If
8cd8: ad 27 aa  loc_8cd8        LDA FoeInt           ;     If
8cdb: c9 0a                     CMP #$0a             ;        (FoeInt >= $0a (10))
8cdd: 90 1f                     BCC loc_8cfe         ;     Then
8cdf: 18                        CLC                  ;         Set A
8ce0: ad 51 63                  LDA ChrChrCalc       ;              =
8ce3: 6d 76 19                  ADC Dapperness       ;                 ChrChrCalc + Dapperness
8ce6: a2 07                     LDX #$07             ;         Set X = 7
8ce8: 20 0d 8f                  JSR sub_8f0d         ;         Call $8f0d [sub_8f0d] (in A, X)
8ceb: 30 11                     BMI loc_8cfe         ;         If (N == 0) Then
8ced: ad 0a d2                  LDA RANDOM           ;             If
8cf0: c9 04                     CMP #$04             ;                (random byte < 4)           (4/256 = 1.56% chance)
8cf2: b0 07                     BCS loc_8cfb         ;             Then
8cf4: a2 52                     LDX #$52             ;                 Set X = $52 ($6352 [ChrChrBase])
8cf6: a9 01                     LDA #$01             ;                 Set A = 1
8cf8: 20 78 18                  JSR j_incChrAttr8    ;                 Call $1878 [j_incChrAttr8] (in A, X)
                                                     ;             End If
8cfb: 4c 9d 84  loc_8cfb        JMP cont_849d        ;             Continue @ $849d [cont_849d]
                                                     ;         End If
                                                     ;     End If
8cfe: a2 9c     loc_8cfe        LDX #$9c             ;     Set
8d00: a0 0c                     LDY #$0c             ;         Y/X = $9c0c [StrNotGngForIt]
8d02: d0 27                     BNE loc_8d2b         ; Else
8d04: 38        loc_8d04        SEC                  ;     Set A
8d05: ad 61 63                  LDA ChrIntCalc       ;           =
8d08: ed 27 aa                  SBC FoeInt           ;             ChrIntCalc - FoeInt
8d0b: 90 1a                     BCC loc_8d27         ;     If (C == 1) Then
8d0d: a2 06                     LDX #$06             ;         Set X = 6
8d0f: 20 0d 8f                  JSR sub_8f0d         ;         Call $8f0d [sub_8f0d] (in A, X)
8d12: 30 13                     BMI loc_8d27         ;         If (N == 0) Then
8d14: e6 97                     INC dat_0097         ;             Add 1 to dat_0097
8d16: ad 0a d2                  LDA RANDOM           ;             If
8d19: c9 03                     CMP #$03             ;                (random byte < 3)
8d1b: b0 11                     BCS loc_8d2e         ;             Then
8d1d: a6 62                     LDX dat_0062         ;                 Set X = dat_0062
8d1f: a9 01                     LDA #$01             ;                 Set A = 1
8d21: 20 78 18                  JSR j_incChrAttr8    ;                 Call $1878 [j_incChrAttr8] (in A, X)
8d24: 4c 2e 8d                  JMP loc_8d2e         ;             End If
                                                     ;             Continue @ $8d2e [loc_8d2e] -> $8b80 [cont_8b80]
                                                     ;         End If
                                                     ;     End If
8d27: a2 9b     loc_8d27        LDX #$9b             ;     Set
8d29: a0 f4                     LDY #$f4             ;         Y/X = $9bf4 [StrTrickFailed]
                                                     ; End If
8d2b: 20 d1 8e  loc_8d2b        JSR dsplyMsg4Secs    ; Call $8ed1 [dsplyMsg4Secs]   (in Y/X)
8d2e: 4c 80 8b  loc_8d2e        JMP cont_8b80        ; Continue @ $8b80 [cont_8b80]

                ;
                ;
                ;
8d31: 20 cb 8c  cont_8d31       JSR sub_8ccb         ; Call $8ccb [sub_8ccb]
8d34: a9 06                     LDA #$06             ; Set A = 6
8d36: 20 99 18                  JSR j_randInRange    ; Call $1899 [j_randInRange]
8d39: a8                        TAY                  ; Set Y = A
8d3a: be ec 76                  LDX PrvsnAttrOfs,Y   ; Set X = PrvsnAttrOfs[Y]
8d3d: bd 00 63                  LDA CHR_STATE,X      ; If (CHR_STATE[X] == 0)
8d40: d0 16                     BNE loc_8d58         ; Then
8d42: fe 00 63                  INC CHR_STATE,X      ;     Add 1 to CHR_STATE[X]
8d45: b9 f5 98                  LDA PrvsnNames_L,Y   ;     Set
8d48: 8d d9 76                  STA GrbItemName_L    ;         GrbItemName_L/H
8d4b: b9 01 99                  LDA PrvsnNames_H,Y   ;         to
8d4e: 8d da 76                  STA GrbItemName_H    ;         PrvsnNames_L/H[Y]
8d51: a2 9c                     LDX #$9c             ;     Set
8d53: a0 39                     LDY #$39             ;         Y/X = $9c39 [StrForTheCause]
8d55: 20 d1 8e                  JSR dsplyMsg4Secs    ;     Call $8ed1 [dsplyMsg4Secs]   (in Y/X)
                                                     ; End If
8d58: 4c 74 8d  loc_8d58        JMP cont_8d74        ; Continue @ $8d74 [cont_8d74]


                ;
                ;
                ;
8d5b: 20 cb 8c  cont_8d5b       JSR sub_8ccb         ; Call $8ccb [sub_8ccb]
8d5e: a9 05                     LDA #$05             ; Set A = 5
8d60: 20 99 18                  JSR j_randInRange    ; Call $1899 [j_randInRange]   (in A)
8d63: aa                        TAX                  ; Set X = A
8d64: bc 7c a8                  LDY HailRspnses_L,X  ; Set
8d67: bd 82 a8                  LDA HailRspnses_H,X  ;     Y/X = HailRspnses_L/H[X]
8d6a: aa                        TAX                  ; Set X = A
8d6b: 20 d1 8e                  JSR dsplyMsg4Secs    ; Call $8ed1 [dsplyMsg4Secs]   (in Y/X)

                ; When Foe_aa21 >= 0, display a message for 4 seconds indicating the foe abandoned the engagement.
                ;
                ; Input
                ;   Foe_aa21  - Returns immediately without displaying the message when <0
                ;
8d6e: ad 21 aa  sub_8d6e        LDA Foe_aa21         ; If (Foe_aa21 < 0) Then
8d71: 10 01                     BPL cont_8d74        ;     Return to caller
8d73: 60                        RTS                  ; End If

                ; Display a message for 4 seconds indicating the foe abandoned the engagement.
                ;
8d74: a2 a4     cont_8d74       LDX #$a4             ; Set
8d76: a0 ec                     LDY #$ec             ;     Y/X = $a4ec [StrItLeaves]
8d78: 20 d1 8e                  JSR dsplyMsg4Secs    ; Call $8ed1 [dsplyMsg4Secs]   (in Y/X)
8d7b: 4c 6d 77                  JMP cont_776d        ; Continue @ $776d [cont_776d]

                ;
                ; - Calls $8e1d [sub_8e1d]
                ; - Determines player weapon damage stats
                ; - Determines equipped weapon name
                ;
                ; Input
                ;   ChrPriWeapon    - Player's equipped primary weapon
                ;   ChrSecWeapon    - Player's equipped secondary weapon
                ;
                ; Output
                ;   StrYour[15..16] - Assigned address of player weapon name zts
                ;   dat_9e3e_L/H    - Assigned address of player weapon name zts
                ;   dat_0066_L/H    - Assigned address of equipped player weapon with highest parry value.
                ;                     Will be 0 if the player not equipped any weapons.
                ;   dat_0064_L/H    - Assigned address of the damage stats for the equipped player weapon with
                ;                     highest parry value, or the player's bare hand damage stats ($6400 [HandDmgBlunt])
                ;                     if no weapons are equipped.
                ;
                ; Temp
                ;   dat_0096        - Temp to hold parry value for the equipped primary weapon (if any)
                ;   ItemIndex       - Parameter to j_getItemAdr
                ;   ItemAddr_L/H    - Holds item addresses
                ;   ItemAttrs_L/H   - Holds item attribute addresses
                ;
8d7e: 20 1d 8e  sub_8d7e        JSR sub_8e1d         ; Call $8e1d [sub_8e1d]
8d81: a9 00                     LDA #$00             ; Set
8d83: 85 64                     STA dat_0064_L       ;     dat_0064_L/H
8d85: a9 64                     LDA #$64             ;        =
8d87: 85 65                     STA dat_0064_H       ;          $6400 [HandDmgBlunt]
8d89: a9 1f                     LDA #$1f             ; Set
8d8b: 8d 3c 9e                  STA StrYour+15       ;     StrYour[15..16]
8d8e: a9 a0                     LDA #$a0             ;        =
8d90: 8d 3d 9e                  STA StrYour+16       ;          $a01f [ZtsBareHand2]
8d93: a9 00                     LDA #$00             ; Set
8d95: 85 66                     STA dat_0066_L       ;     dat_0066_L = 0
8d97: 85 67                     STA dat_0066_H       ; Set dat_0066_H = 0
8d99: ad 9c 63                  LDA ChrPriWeapon     ; Set
8d9c: 85 4b                     STA ItemIndex        ;     ItemIndex = ChrPriWeapon
8d9e: 30 23                     BMI loc_8dc3         ; If (ItemIndex >= 0) Then             (weapon equipped)
8da0: 20 87 18                  JSR j_getItemAdr     ;     Call $1887 [j_getItemAdr]
8da3: 18                        CLC                  ;     Set A
8da4: a9 06                     LDA #$06             ;           =
8da6: 65 41                     ADC ItemAdr_L        ;             ItemAdr_L + 6            (C = 1 on overflow else 0)
8da8: 8d 3c 9e                  STA StrYour+15       ;     Set StrYour[15] = A              (weapon item name LSB)
8dab: 8d 3e 9e                  STA dat_9e3e_L       ;     Set dat_9e3e_L = A
8dae: a5 42                     LDA ItemAdr_H        ;     Set
8db0: 69 00                     ADC #$00             ;         A = ItemAdr_H + C
8db2: 8d 3d 9e                  STA StrYour+16       ;     Set StrYour[16] = A
8db5: 8d 3f 9e                  STA dat_9e3e_H       ;     Set dat_9e3e_H = A
8db8: 20 96 18                  JSR j_getItemAttrs   ;     Call $1896 [j_getItemAttrs]
8dbb: a5 43                     LDA ItemAttrs_L      ;     Set
8dbd: 85 64                     STA dat_0064_L       ;         dat_0064_L = ItemAttrs_L
8dbf: a5 44                     LDA ItemAttrs_H      ;     Set
8dc1: 85 65                     STA dat_0064_H       ;         dat_0064_H = ItemAttrs_H
                                                     ; End If
8dc3: a9 00     loc_8dc3        LDA #$00             ; Set                                  (determine equipped weapon
8dc5: 85 96                     STA dat_0096         ;     dat_0096 = 0                      with highest parry value)
8dc7: ad 9c 63                  LDA ChrPriWeapon     ; If (ChrPriWeapon >= 0)               (primary weapon equipped)
8dca: 30 12                     BMI loc_8dde         ; Then
8dcc: 85 a9                     STA dat_00a9         ;     Set dat_00a9 = ChrPriWeapon
8dce: a0 12                     LDY #$12             ;     Set Y = $12 (18)
8dd0: b1 64                     LDA (dat_0064_L),Y   ;     If ((*dat_0064_L)[18] == 0) Then     (no parry)
8dd2: f0 3d                     BEQ loc_8e11         ;         Continue @ $8e11 [loc_8e11]
                                                     ;     End If
8dd4: 85 96                     STA dat_0096         ;     Set dat_0096 = (*dat_0064_L)[18]     (18 = parry value)
8dd6: a5 64                     LDA dat_0064_L       ;     Set
8dd8: 85 66                     STA dat_0066_L       ;         dat_0066_L = dat_0064_L
8dda: a5 65                     LDA dat_0064_H       ;     Set
8ddc: 85 67                     STA dat_0066_H       ;         dat_0066_H = dat_0064_H
                                                     ; End If
8dde: ad 9d 63  loc_8dde        LDA ChrSecWeapon     ; If (ChrSecWeapon >= 0)               (secondary weapon equipped)
8de1: 30 2e                     BMI loc_8e11         ; Then
8de3: 85 4b                     STA ItemIndex        ;     Set ItemIndex = ChrSecWeapon
8de5: 20 87 18                  JSR j_getItemAdr     ;     Call $1887 [j_getItemAdr] (param ItemIndex)
8de8: 20 96 18                  JSR j_getItemAttrs   ;     Call $1896 [j_getItemAttrs]
8deb: a0 12                     LDY #$12             ;     Set Y = $12 (18)
8ded: b1 43                     LDA (ItemAttrs_L),Y  ;     If ((*ItemAttrs_L)[18] != 0)
8def: f0 20                     BEQ loc_8e11         ;        And
8df1: c5 96                     CMP dat_0096         ;        ((*ItemAttrs_L)[18] >= dat_0096)  (18 = parry value)
8df3: 90 1c                     BCC loc_8e11         ;     Then
8df5: ad 9d 63                  LDA ChrSecWeapon     ;         Set
8df8: 85 a9                     STA dat_00a9         ;             dat_00a9 = ChrSecWeapon
8dfa: a5 43                     LDA ItemAttrs_L      ;         Set
8dfc: 85 66                     STA dat_0066_L       ;             dat_0066_L = ItemAttrs_L
8dfe: a5 44                     LDA ItemAttrs_H      ;         Set
8e00: 85 67                     STA dat_0066_H       ;             dat_0066_H = ItemAttrs_H
8e02: 18                        CLC                  ;         Set
8e03: a5 41                     LDA ItemAdr_L        ;             dat_9e3e_L
8e05: 69 06                     ADC #$06             ;                =
8e07: 8d 3e 9e                  STA dat_9e3e_L       ;                  ItemAdr_L + 6         (C = 1 on overflow else 0)
8e0a: a5 42                     LDA ItemAdr_H        ;         Set dat_9e3e_H
8e0c: 69 00                     ADC #$00             ;                =
8e0e: 8d 3f 9e                  STA dat_9e3e_H       ;                  dat_9e3e_H + C
                                                     ;     End If
                                                     ; End If
8e11: a9 02     loc_8e11        LDA #$02             ; Set
8e13: 18                        CLC                  ;     dat_0066_L
8e14: 65 66                     ADC dat_0066_L       ;        =
8e16: 85 66                     STA dat_0066_L       ;          dat_0066_L + 2
8e18: 90 02                     BCC loc_8e1c         ; If (C == 1) Then
8e1a: e6 67                     INC dat_0066_H       ;     Add 1 to dat_0066_H
                                                     ; End If
8e1c: 60        loc_8e1c        RTS                  ; Return to caller

                ; Sets dat_0086 to the minimum of $40 and ChrLuck << 4.
                ;
                ; Input
                ;   ChrLuck  -
                ;
8e1d: ad 84 63  sub_8e1d        LDA ChrLuck          ; Set A = ChrLuck
8e20: c9 05                     CMP #$05             ; If (A >= 5)
8e22: 90 02                     BCC loc_8e26         ; Then
8e24: a9 04                     LDA #$04             ;     Set A = 4
                                                     ; End If
8e26: 0a        loc_8e26        ASL                  ; Set
8e27: 0a                        ASL                  ;     A
8e28: 0a                        ASL                  ;       =
8e29: 0a                        ASL                  ;         A << 4
8e2a: 85 86                     STA dat_0086         ; Set dat_0086 = A
8e2c: 60                        RTS                  ; Return to caller

                ; Applies 50% chance that the durability of the weapon at index dat_00a9 (or the player's equipped
                ;     primary weapon when dat_00a9 is less than 0) is decreased by 1.
                ;
                ; - Does nothing if dat_00a9 is less than zero and no equipped primary weapon
                ; - Displays the "about to break" message if the durability reaches 5.
                ;
                ; Input
                ;   dat_00a9 - The weapon item index to use (defaults to the equipped primary if less than 0).
                ;
8e2d: a5 a9     contDecDurblty  LDA dat_00a9         ; Set A = dat_00a9
8e2f: 10 03                     BPL loc_8e34         ; If (A >= 0) Then
                                                     ;     Continue @ $8e34 [loc_8e34]   (skip pri weapon assignment)
                                                     ; End If
                                                     ; (otherwise, continue and assign pri weapon to A)

                ; Applies 50% chance that the durability of the player's equipped primary weapon is decreased by 1.
                ;
                ; - Does nothing if no equipped primary weapon
                ; - Displays the "about to break" message if the durability reaches 5.
                ;
                ;
8e31: ad 9c 63  decDurability   LDA ChrPriWeapon     ; Set A = ChrPriWeapon
8e34: 30 38     loc_8e34        BMI loc_8e6e         ; If (A >= 0) Then
8e36: 85 4b                     STA ItemIndex        ;     Set ItemIndex = A
8e38: 20 87 18                  JSR j_getItemAdr     ;     Call $1887 [j_getItemAdr] (in ItemIndex)
8e3b: f0 31                     BEQ loc_8e6e         ;     If (Z == 0)                      (item found in slot)
8e3d: ad 0a d2                  LDA RANDOM           ;        And (random byte < 0)         (50% chance)
8e40: 30 2c                     BMI loc_8e6e         ;     Then
8e42: 18                        CLC                  ;         Set
8e43: a9 06                     LDA #$06             ;             GrbItemName_L
8e45: 65 41                     ADC ItemAdr_L        ;                =
8e47: 8d d9 76                  STA GrbItemName_L    ;                  ItemAdr_L + 6       (C = 1 on overflow else 0)
8e4a: a9 00                     LDA #$00             ;         Set GrbItemName_H
8e4c: 65 42                     ADC ItemAdr_H        ;                =
8e4e: 8d da 76                  STA GrbItemName_H    ;                  ItemAdr_H + C
8e51: 20 96 18                  JSR j_getItemAttrs   ;         Call $1896 [j_getItemAttrs]
8e54: a0 0f                     LDY #$0f             ;         Set Y = $f (15)               (attribute 15 = Durability)
8e56: b1 43                     LDA (ItemAttrs_L),Y  ;         If
8e58: c9 ff                     CMP #$ff             ;            ((*ItemAttrs_L)[15] != $ff)           ($ff = infinite)
8e5a: f0 12                     BEQ loc_8e6e         ;         Then
8e5c: 38                        SEC                  ;             Set (*ItemAttrs_L)[15]
8e5d: e9 01                     SBC #$01             ;                    =
8e5f: 91 43                     STA (ItemAttrs_L),Y  ;                      (*ItemAttrs_L)[15] - 1
8e61: f0 0c                     BEQ contHasBroken    ;             If ((*ItemAttrs_L)[15] == 0) Then    (it broke)
                                                     ;                 Continue @ $8e6f [contHasBroken]
8e63: c9 05                     CMP #$05             ;             Else If ((*ItemAttrs_L)[15] < 5)
8e65: b0 07                     BCS loc_8e6e         ;             Then
8e67: a2 9e                     LDX #$9e             ;                 Set
8e69: a0 04                     LDY #$04             ;                     Y/X = $9e04 [StrAbout2Break]
8e6b: 20 7f 8e                  JSR shwMsgAndUpdt    ;                 Call $8e7f [shwMsgAndUpdt] (in Y/X)
                                                     ;             End If
                                                     ;         End If
                                                     ;     End If
                                                     ; End If
8e6e: 60        loc_8e6e        RTS                  ; Return to caller

                ; Continues here when the player's weapon breaks
                ;
8e6f: a0 02     contHasBroken   LDY #$02             ; Set Y = 2
8e71: a9 10                     LDA #$10             ; Set
8e73: 91 41                     STA (ItemAdr_L),Y    ;     (*ItemAdr_L)[2] = $10 (16)
8e75: a2 9e                     LDX #$9e             ; Set
8e77: a0 1c                     LDY #$1c             ;     Y/X = $9e1c [StrHasBroken]
8e79: 20 7f 8e                  JSR shwMsgAndUpdt    ; Call $8e7f [shwMsgAndUpdt] (in Y/X)
8e7c: 4c 7e 8d                  JMP sub_8d7e         ; Continue @ $8d7e [sub_8d7e]

                ; Displays a message, waits for any key to be pressed and applies item trigger and stat updates.
                ;
                ; Input
                ;   Y/X   - Holds address of the template messaeg string to output.
                ;
8e7f: 20 ef 8e  shwMsgAndUpdt   JSR dsplyTmpltStr    ; Call $8eef [dsplyTmpltStr] (in Y/X)
8e82: 20 3c 18                  JSR j_pressAnyKey    ; Call $183c [j_pressAnyKey]
8e85: a2 98                     LDX #$98             ; Set
8e87: a0 81                     LDY #$81             ;     Y/X = $9881 [StrClearRows]
8e89: 20 ef 8e                  JSR dsplyTmpltStr    ; Call $8eef [dsplyTmpltStr] (in Y/X)
8e8c: 4c f9 8e                  JMP applyUpdates     ; Continue @ $8ef9 [applyUpdates]

                ; Computes the sum of the damage attributes and stores it into dat_00a8_L/H
                ;
8e8f: a9 00     sub_8e8f        LDA #$00             ; Set
8e91: 85 a7                     STA dat_00a7_H       ;     dat_00a7_H = 0
8e93: 85 a8                     STA dat_00a8_L       ; Set dat_00a8_L = 0
8e95: a2 0a                     LDX #$0a             ; Set X = $a (10)
8e97: bd dd 63  loc_8e97        LDA Chr_BluntDmg,X   ; Loop
8e9a: 18                        CLC                  ;     Set dat_00a8_L
8e9b: 65 a8                     ADC dat_00a8_L       ;            =
8e9d: 85 a8                     STA dat_00a8_L       ;              dat_00a8_L + Chr_BluntDmg[X]
8e9f: 90 02                     BCC loc_8ea3         ;     If (C == 1) Then
8ea1: e6 a7                     INC dat_00a7_H       ;         Add 1 to dat_00a7_H
                                                     ;     End If
8ea3: ca        loc_8ea3        DEX                  ;     Subtract 1 from X
8ea4: 10 f1                     BPL loc_8e97         ; Repeat while (X >= 0)
8ea6: 60                        RTS                  ; Return to caller

                ;
                ;
                ;
8ea7: ac 00 aa  sub_8ea7        LDY FoeCount         ; Set Y = FoeCount
8eaa: a2 00                     LDX #$00             ; Set X = 0
8eac: b5 b2     loc_8eac        LDA FoeHpTbl_H,X     ; Loop
8eae: cd 22 aa                  CMP FoeHp_H          ;     If (FoeHpTbl_H[X] > FoeHp_H)
8eb1: 90 15                     BCC loc_8ec8         ;        And (
8eb3: f0 02                     BEQ loc_8eb7         ;            ( (FoeHpTbl_H[X] != 0)
8eb5: b0 07                     BCS loc_8ebe         ;               And (FoeHpTbl_H[X] > FoeHp_H) )
8eb7: b5 b3     loc_8eb7        LDA FoeHpTbl_L,X     ;            Or
8eb9: cd 23 aa                  CMP FoeHp_L          ;            ( (FoeHpTbl_H[X] == 0)
                                                     ;               And (FoeHpTbl_L[X] > FoeHp_L) )
8ebc: 90 0a                     BCC loc_8ec8         ;         Then
8ebe: ad 22 aa  loc_8ebe        LDA FoeHp_H          ;             Set
8ec1: 95 b2                     STA FoeHpTbl_H,X     ;                 FoeHpTbl_H[X] = FoeHp_H
8ec3: ad 23 aa                  LDA FoeHp_L          ;             Set
8ec6: 95 b3                     STA FoeHpTbl_L,X     ;                 FoeHpTbl_L[X] = FoeHp_L
                                                     ;         End If
                                                     ;     End If
8ec8: e8        loc_8ec8        INX                  ;     Set
8ec9: e8                        INX                  ;         X = X + 2
8eca: 88                        DEY                  ;     Subtract 1 from Y
8ecb: d0 df                     BNE loc_8eac         ; Repeat while (Y >= 0)
8ecd: 60                        RTS                  ; Return to caller

                ; Displays the message at the address in Y/X for 2 seconds
                ;
                ; Input
                ;   Y/X   - Address of template string to display
                ;
8ece: a9 02     dsplyMsg2Secs   LDA #$02             ; Set A = 2
8ed0: 2c        nop_8ed0        .BYTE $25c           ; Forms `BIT $04a9` (NOP) with the next 2 bytes, skipping the LDA

                ; Displays the message at the address in Y/X for 4 seconds
                ;
                ; Input
                ;   Y/X   - Address of template string to display
                ;
8ed1: a9 04     dsplyMsg4Secs   LDA #$04             ; Set A = 4
8ed3: 48                        PHA                  ; Save A to the stack
8ed4: 20 ef 8e                  JSR dsplyTmpltStr    ; Call $8eef [dsplyTmpltStr] (in Y/X)   (show the message)
8ed7: 68                        PLA                  ; Restore A from the stack
8ed8: c6 32                     DEC TimePaused       ; Subtract 1 from TimePaused               (pause game time)
8eda: 20 5a 18                  JSR j_waitSeconds    ; Call $185a [j_waitSeconds]               (wait A seconds)
8edd: e6 32                     INC TimePaused       ; Add 1 to TimePaused                      (unpause game time)
8edf: a2 98                     LDX #$98             ; Set
8ee1: a0 81                     LDY #$81             ;     Y/X = $9881 [StrClearRows]
8ee3: 20 ef 8e                  JSR dsplyTmpltStr    ; Call $8eef [dsplyTmpltStr] (in Y/X)   (clear the message)
8ee6: a2 02                     LDX #$02             ; Set X = 2
8ee8: 20 80 92  loc_8ee8        JSR waitForVblankC   ; Loop
                                                     ;     Call $9280 [waitForVblankC]
8eeb: ca                        DEX                  ;     Subtract 1 from X
8eec: d0 fa                     BNE loc_8ee8         ; Repeat while (X != 0)
8eee: 60                        RTS                  ; Return to caller

                ; Displays the template string at the address in Y/X.
                ;
                ; Input
                ;   Y/X   - LSB/MSB of template string address
                ;
8eef: 84 16     dsplyTmpltStr   STY StrTmplate_L     ; Set
8ef1: 86 17                     STX StrTmplate_H     ;     StrTmplate_L/H = Y/X
8ef3: ae 92 a8                  LDX ModuleStatusPg   ; Set X = ModuleStatusPg
8ef6: 4c 51 18                  JMP j_setStatPgStr2  ; Continue @ $1851 [j_setStatPgStr2]

                ; Execute item triggers and stat re-calcs
                ;
8ef9: a5 32     applyUpdates    LDA TimePaused       ; Save TimePaused
8efb: 48                        PHA                  ;     To the stack
8efc: a9 00                     LDA #$00             ; Set
8efe: 85 32                     STA TimePaused       ;     TimePaused = 0
8f00: ce 60 19                  DEC ItemStatUpdFlg   ; Subtract 1 from ItemStatUpdFlg
8f03: ce 5f 19                  DEC StatUpdateFlg    ; Subtract 1 from StatUpdateFlg
8f06: 20 a5 18                  JSR j_applyAllCalcs  ; Call $1885 [j_applyAllCalcs]
8f09: 68                        PLA                  ; Restore TimePaused
8f0a: 85 32                     STA TimePaused       ;      from the stack
8f0c: 60                        RTS                  ; Return to caller

                ;
                ; Input
                ;   A        -
                ;   X        - Base value of XXX. The value of ChrLuck is added to this before calling sub_8f15
                ;   ChrLuck  - Player's current luck value
                ;
8f0d: 48        sub_8f0d        PHA                  ; Push A to the stack
8f0e: 8a                        TXA                  ; Set
8f0f: 18                        CLC                  ;     X
8f10: 6d 84 63                  ADC ChrLuck          ;       =
8f13: aa                        TAX                  ;         X + ChrLuck
8f14: 68                        PLA                  ; Restore A from the stack

                ;
                ; Input
                ;   A        -
                ;   X        -
                ;
                ; ???
                ;   dat_0077 -
                ;   dat_0078 - Assigned the input value of A
                ;   dat_0079 - Possible MSB of uint16 with dat_0078?
                ;
8f15: 86 77     sub_8f15        STX dat_0077         ; Set dat_0077 = X
8f17: a2 00                     LDX #$00             ; Set
8f19: 86 79                     STX dat_0079         ;     dat_0079 = 0
8f1b: 85 78                     STA dat_0078         ; Set dat_0078 = A
8f1d: 38                        SEC                  ; Set
8f1e: e9 80                     SBC #$80             ;     A = A - $80
8f20: 90 09                     BCC loc_8f2b         ; If (C == 1) Then       (no underflow)
8f22: 4a                        LSR                  ;      Set
8f23: 4a                        LSR                  ;          dat_0079
8f24: 4a                        LSR                  ;             =
8f25: 85 79                     STA dat_0079         ;               A >> 3
8f27: a9 80                     LDA #$80             ;      Set
8f29: 85 78                     STA dat_0078         ;          dat_0078 = $80
                                                     ; End If
8f2b: a5 78     loc_8f2b        LDA dat_0078         ; Set A
8f2d: 38                        SEC                  ;       =
8f2e: e9 10                     SBC #$10             ;         dat_0078 - $10 (16)          (C = 0 on underflow else 1)
8f30: 90 0b                     BCC loc_8f3d         ; If (C == 1) Then    (no underflow)
8f32: 4a                        LSR                  ;     Set
8f33: 4a                        LSR                  ;         dat_0079
8f34: 18                        CLC                  ;           =
8f35: 65 79                     ADC dat_0079         ;             (A >> 2)
8f37: 85 79                     STA dat_0079         ;                 + dat_0079
8f39: a9 10                     LDA #$10             ;     Set
8f3b: 85 78                     STA dat_0078         ;         dat_0078 = $10 (16)
                                                     ; End If
8f3d: 18        loc_8f3d        CLC                  ; Set A
8f3e: a5 78                     LDA dat_0078         ;       =
8f40: 65 79                     ADC dat_0079         ;         dat_0078 + dat_0079
8f42: 85 79                     STA dat_0079         ; Set dat_0079 = A
8f44: a6 77                     LDX dat_0077         ; Set X = dat_0077
8f46: 20 49 90                  JSR multBytesAX      ; Call $9049 [multBytesAX] (in A, X; out UInt16Val_L/H)
8f49: a5 03                     LDA UInt16Val_H      ; If (UInt16Val_H != 0)
8f4b: f0 04                     BEQ loc_8f51         ; Then
8f4d: a9 f4                     LDA #$f4             ;     Set A = $f4
8f4f: 30 08                     BMI loc_8f59         ; Else If
8f51: a5 02     loc_8f51        LDA UInt16Val_L      ;    (UInt16Val_L >= $f5)
8f53: c9 f5                     CMP #$f5             ; Then
8f55: 90 02                     BCC loc_8f59         ;     Set A = $f4
8f57: a9 f4                     LDA #$f4             ; End If
8f59: 85 79     loc_8f59        STA dat_0079         ; Set dat_0079 = A
8f5b: ad 0a d2                  LDA RANDOM           ; Set
8f5e: 85 96                     STA dat_0096         ;     dat_0096 = random byte
8f60: c5 79                     CMP dat_0079         ; If (dat_0096 < dat_0079)
8f62: b0 19                     BCS loc_8f7d         ; Then
8f64: a9 01                     LDA #$01             ;     Set
8f66: 85 78                     STA dat_0078         ;         dat_0078 = 1
8f68: a5 96                     LDA dat_0096         ;     Set A = dat_0096
8f6a: c9 10                     CMP #$10             ;     If (A < $10 (16))
8f6c: b0 0c                     BCS loc_8f7a         ;     Then
8f6e: 0a                        ASL                  ;         Set
8f6f: 0a                        ASL                  ;             A
8f70: 0a                        ASL                  ;               =
8f71: 0a                        ASL                  ;                 A << 4
8f72: c5 79                     CMP dat_0079         ;         If (A < dat_0079)
8f74: b0 04                     BCS loc_8f7a         ;         Then
8f76: a9 00                     LDA #$00             ;             Set
8f78: 85 78                     STA dat_0078         ;                 dat_0078 = 0
                                                     ;         End If
                                                     ;     End If
8f7a: a5 78     loc_8f7a        LDA dat_0078         ; Else
8f7c: 60                        RTS                  ;      .
8f7d: a9 80     loc_8f7d        LDA #$80             ;     Set
8f7f: 85 78                     STA dat_0078         ;         dat_0078 = $80
8f81: ad 0a d2                  LDA RANDOM           ;     If (random byte < 8)             (8/256 = 3.13% chance)
8f84: c9 08                     CMP #$08             ;     Then
8f86: b0 f2                     BCS loc_8f7a         ;         Set
8f88: a9 ff                     LDA #$ff             ;             dat_0078 = $ff
8f8a: 85 78                     STA dat_0078         ;     End If
                                                     ; End If
8f8c: 30 ec                     BMI loc_8f7a         ; Set A = dat_0078
                                                     ; Return to caller

                ; Rolls dice as specified in A (# of dice in high nibble, # sides in low).
                ;
                ; Input
                ;   A - byte containing the number of dice to roll in the high nibble and the number of sides of
                ;       the dice in the low nibble.
                ;          DDDD SSSS
                ;            |    +-- Number of sides
                ;            +------- Number of dice to roll
                ;   X - Assigned into TmpRollDiceX and restored on return
                ;   Y - Assigned into TmpRollDiceY and restored on return
                ;
                ; Output
                ;   A          - LSB of uint16 total rolled (same value as DiceRoll_L)
                ;   X          - Unchanged
                ;   Y          - Unchanged
                ;   DiceRoll_L - LSB of uint16 dice roll total
                ;   DiceRoll_H - MSB of uint16 dice roll total
                ;
                ; Temp
                ;   DiceCount    - 0 on return
                ;   DiceSides    - Set to low nibble of input A
                ;   TmpRollDiceX - The input value of X
                ;   TmpRollDiceY - The input value of Y
                ;
8f8e: 8e 96 a8  rollDiceA       STX TmpRollDiceX     ; Set TmpRollDiceX = X         (save to restore on return)
8f91: 8c 97 a8                  STY TmpRollDiceY     ; Set TmpRollDiceY = Y         (save to restore on return)
8f94: 85 02                     STA UInt16Val_L      ; Set UInt16Val_L = A          (save to restore below)
8f96: a2 00                     LDX #$00             ; Set
8f98: 86 7b                     STX DiceRoll_H       ;     DiceRoll_H = 0
8f9a: 86 7a                     STX DiceRoll_L       ; Set DiceRoll_L = 0
8f9c: 4a                        LSR                  ; Set
8f9d: 4a                        LSR                  ;     DiceCount
8f9e: 4a                        LSR                  ;       =
8f9f: 4a                        LSR                  ;         A >> 4
8fa0: 85 87                     STA DiceCount        ; If (DiceCount == 0) Then
8fa2: f0 25                     BEQ rts_8fc9         ;     Continue @ $8fc9 [rts_8fc9]
                                                     ; End If
8fa4: a5 02                     LDA UInt16Val_L      ; Set DiceSides
8fa6: 29 0f                     AND #$0f             ;        =
8fa8: 85 88                     STA DiceSides        ;          UInt16Val_L & $f

                ; Rolls DiceCount dice with DiceSides sides.
                ;
                ; Input
                ;   DiceCount    - Number of dice to roll (256 rolls will be performed if 0)
                ;   DiceSides    - Number of sides to dice rolled (If 0, no iterations are performed)
                ;   TmpRollDiceX -
                ;   TmpRollDiceY  -
                ;
                ; Output
                ;   A          - LSB of uint16 total rolled (same value as DiceRoll_L)
                ;   X          - Assigned the value of TmpRollDiceX
                ;   Y          - Assigned the value of TmpRollDiceY
                ;   DiceRoll_L - LSB of uint16 total rolled
                ;   DiceRoll_H - MSB of uint16 total rolled
                ;   DiceCount  - Set to 0
                ;
8faa: a9 00     rollDice        LDA #$00             ; Set
8fac: 85 7a                     STA DiceRoll_L       ;     DiceRoll_L = 0
8fae: 85 7b                     STA DiceRoll_H       ; Set DiceRoll_H = 0
8fb0: ad 0a d2  loc_8fb0        LDA RANDOM           ; Loop
                                                     ;     Set A = random byte
8fb3: a6 88                     LDX DiceSides        ;     Set X = DiceSides
8fb5: f0 12                     BEQ rts_8fc9         ;     If (X == 0) Then
                                                     ;         Exit Loop
                                                     ;     End If
8fb7: 20 49 90                  JSR multBytesAX      ;     Call $9049 [multBytesAX] (in A, X; out UInt16Val_L/H)
8fba: a5 03                     LDA UInt16Val_H      ;     Set
8fbc: 38                        SEC                  ;         DiceRoll_L
8fbd: 65 7a                     ADC DiceRoll_L       ;            =        (8.8 fixed pt: UInt16Val_H is 0..DiceSides-1)
8fbf: 85 7a                     STA DiceRoll_L       ;              DiceRoll_L + UInt16Val_H + 1
8fc1: 90 02                     BCC loc_8fc5         ;     If (C == 1) Then
8fc3: e6 7b                     INC DiceRoll_H       ;         Add 1 to DiceRoll_H
                                                     ;     End If
8fc5: c6 87     loc_8fc5        DEC DiceCount        ;     Subtract 1 from DiceCount
8fc7: d0 e7                     BNE loc_8fb0         ; Repeat while (DiceCount != 0)

8fc9: a5 7a     rts_8fc9        LDA DiceRoll_L       ; Set A = DiceRoll_L
8fcb: ae 96 a8                  LDX TmpRollDiceX     ; Set X = TmpRollDiceX
8fce: ac 97 a8                  LDY TmpRollDiceY     ; Set Y = TmpRollDiceY
8fd1: 60                        RTS                  ; Return to caller

                ; Waits for the player to press 'Y' or 'N' (case-insensitive). If the player is inebriated, there is a
                ;     chance this will automatically report 'Y' was pressed regardless of the player's selection. The
                ;     more drunk, the more likely this will occur.
                ;
                ; - If a key is pressed that is neither 'Y' or 'N', the module's status page is displayed
                ;   if it's not visible and a new key is read.
                ;
                ; Input
                ;   EffInebrLvl - The player's inebriation level
                ;
                ; Output
                ;   C   - 0 if 'Y' is selected, 1 if 'N' is selected
                ;
8fd2: c6 32     readYorN        DEC TimePaused       ; Loop
                                                     ;     Subtract 1 from TimePaused
8fd4: a9 e1                     LDA #$e1             ;     Set
8fd6: 8d 77 19                  STA cont_addr_1977_L ;         cont_addr_1977_L/H
8fd9: a9 8f                     LDA #$8f             ;         to
8fdb: 8d 78 19                  STA cont_addr_1977_H ;         $8fe1 [cont_8fe1] (continue @ next op)
8fde: 4c 06 18                  JMP j_sub_2ff3       ;     Continue @ $1806 [j_sub_2ff3]
8fe1: e6 32     cont_8fe1       INC TimePaused       ;     Add 1 to TimePaused
8fe3: a5 31                     LDA KbdChar          ;     Set A = KbdChar
8fe5: 30 eb                     BMI readYorN         ; Repeat while (A < 0)
8fe7: 20 3f 18                  JSR j_charToUpper    ; Call $183f [j_charToUpper] (in A, out A)
8fea: c9 59                     CMP #$59             ; If (A != $59 (89 'Y'))
8fec: f0 2c                     BEQ loc_901a         ; Then
8fee: c9 4e                     CMP #$4e             ;     If (A != $4e (78 'N'))
8ff0: f0 0c                     BEQ loc_8ffe         ;     Then
8ff2: ad 92 a8                  LDA ModuleStatusPg   ;         Set
8ff5: 8d 33 19                  STA CurStatusPage    ;             CurStatusPage = ModuleStatusPg
8ff8: 20 48 18                  JSR j_dispStatusPg   ;         Call $1848 [j_dispStatusPg]
8ffb: 4c d2 8f                  JMP readYorN         ;         Continue @ $8fd2 [readYorN]    (try again)
                                                     ;     End If
8ffe: ad 68 19  loc_8ffe        LDA EffInebrLvl      ;     If (EffInebrLvl == 0)
9001: d0 02                     BNE loc_9005         ;     Then
9003: 38        loc_9003        SEC                  ;         Set C = 1                (player selected 'N')
9004: 60                        RTS                  ;         Return to caller
                                                     ;     End If
9005: 0a        loc_9005        ASL                  ;     Set
9006: 0a                        ASL                  ;         smc_900f[1]
9007: 0a                        ASL                  ;            =
9008: 0a                        ASL                  ;              EffInebrLvl << 4
9009: 8d 10 90                  STA smc_900f+1       ;       .
900c: ad 0a d2                  LDA RANDOM           ;     If (random byte >= smc_900f[1]) (less likely when more drunk)
900f: c9 ff     smc_900f        CMP #$ff             ;     Then
9011: b0 f0                     BCS loc_9003         ;         Set C = 1                   (player selected 'N')
                                                     ;         Return to caller
                                                     ;     End If
9013: a2 9c                     LDX #$9c             ;     Set
9015: a0 fa                     LDY #$fa             ;         Y/X = $9cfa [StrHpplyAccept]
9017: 20 d1 8e                  JSR dsplyMsg4Secs    ;     Call $8ed1 [dsplyMsg4Secs]   (in Y/X)
                                                     ; End If
901a: 18        loc_901a        CLC                  ; Set C = 0             ('Y' was selected)
901b: 60                        RTS                  ; Return to caller

                ; Pauses game time progression and waits for the player to select a menu item.
                ;
                ; Input
                ;   A   - Number of menu items to select between
                ;
                ; Output
                ;   MenuSel - The menu item index selected [0..input A - 1]
                ;   A        - The menu item index selected [0..input A - 1]
                ;   N        - Will always be 0
                ;   Z        - 1 if selected item is 0, otherwise 0
                ;
                ;
901c: 85 74     getMenuSel      STA MenuSel         ; Set MenuSel = A
901e: c6 32                     DEC TimePaused       ; Subtract 1 from TimePaused         (pause time progression)
9020: a9 2d     loc_9020        LDA #$2d             ; Loop
9022: 8d 77 19                  STA cont_addr_1977_L ;     Set cont_addr_1977_L/H
9025: a9 90                     LDA #$90             ;         to
9027: 8d 78 19                  STA cont_addr_1977_H ;         $902d [cont_902d]          (return to next op)
902a: 4c 06 18                  JMP j_sub_2ff3       ;     Call $1806 [j_sub_2ff3]
902d: a5 31     cont_902d       LDA KbdChar          ;     If (KbdChar < 0) Then
902f: 30 ef                     BMI loc_9020         ;         Continue Loop              (no key mapped/pressed)
                                                     ;     End If
9031: 38                        SEC                  ;     If
9032: e9 30                     SBC #$30             ;        (KbdChar - $30 ('0') < MenuSel)
9034: c5 74                     CMP MenuSel         ;     Then
9036: 90 0c                     BCC loc_9044         ;         Exit Loop
                                                     ;     End If
9038: ae 92 a8                  LDX ModuleStatusPg   ;     Set
903b: 8e 33 19                  STX CurStatusPage    ;         CurStatusPage = ModuleStatusPg   (reset displayed Status
903e: 20 48 18                  JSR j_dispStatusPg   ;     Call $1848 [j_dispStatusPg]             page to menu)
9041: 4c 20 90                  JMP loc_9020         ; Repeat while (true)
9044: e6 32     loc_9044        INC TimePaused       ; Add 1 to TimePaused                (unpause time progression)
9046: 85 74                     STA MenuSel          ; Set MenuSel = A
9048: 60                        RTS                  ; Return to caller

                ; Multiplies A by X returning little-endian 16-bit result in UInt16Val_L/H
                ;
                ; Input
                ;   A  - multiplicand 1
                ;   X  - multiplicand 2
                ;
                ; Output
                ;   UInt16Val_L/H - Little-endian uint16 result
                ;   A             - The value of UInt16Val_L (LSB of result)
                ;   X             - Set to 0
                ;
                ; Temp
                ;   Multiplicand - Set to input value of A
                ;   MBTemp2      -
                ;
9049: 85 04     multBytesAX     STA Multiplicand     ; Set Multiplicand = A
904b: 86 05                     STX MBTemp2          ; Set MBTemp2 = X
904d: a9 00                     LDA #$00             ; Set
904f: 85 03                     STA UInt16Val_H      ;     UInt16Val_H = 0
9051: a2 08                     LDX #$08             ; Set X = 8  (8 iterations [8..1])
9053: 0a        loc_9053        ASL                  ; Loop
                                                     ;     Set A = A << 1                                (C = old bit 7)
9054: 26 03                     ROL UInt16Val_H      ;     Set UInt16Val_H
                                                     ;            = (UInt16Val_H << 1) + C              (C = old bit 7)
9056: 06 05                     ASL MBTemp2          ;     Set MBTemp2 = MBTemp2 << 1                    (C = old bit 7)
9058: 90 07                     BCC loc_9061         ;     If (C == 1) Then
905a: 18                        CLC                  ;         Set
905b: 65 04                     ADC Multiplicand     ;             A = A + Multiplicand
905d: 90 02                     BCC loc_9061         ;         If (C == 1) Then
905f: e6 03                     INC UInt16Val_H      ;             Add 1 to UInt16Val_H
                                                     ;         End If
                                                     ;     End If
9061: ca        loc_9061        DEX                  ;     Subtract 1 from X
9062: d0 ef                     BNE loc_9053         ; Repeat while (X != 0)
9064: 85 02                     STA UInt16Val_L      ; Set UInt16Val_L = A
9066: 60                        RTS                  ; Return to caller

                ; Clears row 5 of the top text area (e.g. "There is something here", etc)
                ;
9067: a9 bc     clrSmthngHere   LDA #$bc             ; Set
9069: 85 16                     STA StrTmplate_L     ;     StrTmplate_L/H
906b: a9 a0                     LDA #$a0             ;     to
906d: 85 17                     STA StrTmplate_H     ;     $a0bc [StrClrRow5]
906f: 4c 12 18                  JMP j_printTop       ; Continue @ $1812 [j_printTop]

                ;
                ;
                ;
9072: a5 8a     sub_9072        LDA dat_008a         ; If (A == 0) Then
9074: f0 f1                     BEQ clrSmthngHere    ;     Continue @ $9067 [clrSmthngHere]
                                                     ; End If
9076: a9 aa                     LDA #$aa             ; Set
9078: 85 16                     STA StrTmplate_L     ;     StrTmplate_L/H
907a: a9 a0                     LDA #$a0             ;     to
907c: 85 17                     STA StrTmplate_H     ;     $a0aa [StrYouFace]
907e: 4c 12 18                  JMP j_printTop       ; Continue @ $1812 [j_printTop]

                ;
                ;
                ;
9081: ae 93 64  sub_9081        LDX NextDropped      ; Set X = NextDropped
9084: bd 94 64                  LDA DroppedGame,X    ; If
9087: 29 7f                     AND #$7f             ;    ((DroppedGame[X] & $7f) != 0)
9089: f0 0c                     BEQ loc_9097         ; Then
908b: a5 4b                     LDA ItemIndex        ;     Push ItemIndex
908d: 48                        PHA                  ;         to the stack
908e: bd d4 64                  LDA DroppedItmIdx,X  ;     Set A = DroppedItmIdx[X]
9091: 20 8a 18                  JSR j_removeItem     ;     Call $188a [j_removeItem] (in A)
9094: 68                        PLA                  ;     Restore ItemIndex
9095: 85 4b                     STA ItemIndex        ;         from the stack
                                                     ; End If
9097: a5 4b     loc_9097        LDA ItemIndex        ; Set A = ItemIndex
9099: 20 87 18                  JSR j_getItemAdr     ; Call $1887 [j_getItemAdr]
909c: ae 93 64                  LDX NextDropped      ; Set X = NextDropped
909f: ad 13 63                  LDA CHR_LOC_X        ; Set
90a2: 9d a4 64                  STA DroppedX,X       ;     DroppedX[X] = CHR_LOC_X
90a5: ad 14 63                  LDA CHR_LOC_Y        ; Set
90a8: 9d b4 64                  STA DroppedY,X       ;     DroppedY[X] = CHR_LOC_Y
90ab: ad 15 63                  LDA CHR_LOC_MAP      ; Set
90ae: 9d c4 64                  STA DroppedMap,X     ;     DroppedMap[X] = CHR_LOC_MAP
90b1: a9 02                     LDA #$02             ; Set
90b3: 9d 94 64                  STA DroppedGame,X    ;     DroppedGame[X] = 2
90b6: a5 4b                     LDA ItemIndex        ; Set
90b8: 9d d4 64                  STA DroppedItmIdx,X  ;     DroppedItmIdx[X] = ItemIndex
90bb: e8                        INX                  ; Add 1 to X
90bc: 8a                        TXA                  ; Set NextDropped
90bd: 29 0f                     AND #$0f             ;        =
90bf: 8d 93 64                  STA NextDropped      ;          X & $0f
90c2: 60                        RTS                  ; Return to caller

                ;
                ; - Sets all 12 values of FoeMaxProvsion to 0 (e.g. no standard provision item treasure drops)
                ; - Removes all dropped items present at the player's current location
                ;
90c3: a2 0b     sub_90c3        LDX #$0b             ; Set X = $0b (12 iterations [11..0])
90c5: a9 00                     LDA #$00             ; Set A = 0
90c7: 9d 2b aa  loc_90c7        STA FoeMaxProvsion,X ; Loop
                                                     ;     Set FoeMaxProvsion[X] = 0
90ca: ca                        DEX                  ;     Subtract 1 from X
90cb: 10 fa                     BPL loc_90c7         ; Repeat while (X >= 0)

                ; Unlocks and removes all dropped dungeon items present at the player's current location
                ;
90cd: 20 72 92  rmveAllDropped  JSR unlkDroppdItms   ; Call $9272 [unlkDroppdItms]
90d0: a9 0f                     LDA #$0f             ; Set
90d2: 85 96                     STA dat_0096         ;     dat_0096 = $0f  (16 iterations [15..0])
90d4: a6 96     loc_90d4        LDX dat_0096         ; Loop
                                                     ;     Set X = dat_0096
90d6: bd 94 64                  LDA DroppedGame,X    ;     If
90d9: c9 02                     CMP #$02             ;        (DroppedGame[X] == 2)             (2 = Dungeon)
90db: d0 1e                     BNE loc_90fb         ;
90dd: bd a4 64                  LDA DroppedX,X       ;        And
90e0: cd 13 63                  CMP CHR_LOC_X        ;        (DroppedX[X] == CHR_LOC_X)
90e3: d0 16                     BNE loc_90fb         ;
90e5: bd b4 64                  LDA DroppedY,X       ;        And
90e8: cd 14 63                  CMP CHR_LOC_Y        ;        (DroppedY[X] == CHR_LOC_Y)
90eb: d0 0e                     BNE loc_90fb         ;
90ed: bd c4 64                  LDA DroppedMap,X     ;        And
90f0: cd 15 63                  CMP CHR_LOC_MAP      ;        (DroppedMap[X] == CHR_LOC_MAP)
90f3: d0 06                     BNE loc_90fb         ;     Then
90f5: bd d4 64                  LDA DroppedItmIdx,X  ;         Set A = DroppedItmIdx[X]
90f8: 20 8a 18                  JSR j_removeItem     ;         Call $188a [j_removeItem]
                                                     ;     End If
90fb: c6 96     loc_90fb        DEC dat_0096         ;     Subtract 1 from dat_0096
90fd: 10 d5                     BPL loc_90d4         ; Repeat while (dat_0096 >= 0)
90ff: 60                        RTS                  ; Return to caller

                ;
                ;
                ;
9100: ad 22 aa  sub_9100        LDA FoeHp_H          ; Set
9103: 85 d4                     STA dat_00d4         ;     dat_00d4 = FoeHp_H
9105: ad 23 aa                  LDA FoeHp_L          ; Set
9108: 85 d5                     STA dat_00d5         ;     dat_00d5 = FoeHp_L
910a: ae 1e aa                  LDX Foe_aa1e         ; Set
910d: e8                        INX                  ;     X = Foe_aa1e + 1        (extra 1 is immediately subtracted)
910e: 4c 1f 91                  JMP cont_911f        ; Continue @ $911f [cont_911f]             (jumps to end of loop)
9111: 06 d5     loc_9111        ASL dat_00d5         ; Loop
                                                     ;     Set dat_00d5 = dat_00d5 << 1         (C = old bit 7)
9113: 26 d4                     ROL dat_00d4         ;     Set dat_00d4 = dat_00d4 << 1 | C     (C = old bit 7)
9115: 90 08                     BCC cont_911f        ;     If (C == 1) Then
9117: a9 ff                     LDA #$ff             ;         Set
9119: 85 d4                     STA dat_00d4         ;             dat_00d4 = $ff
911b: 85 d5                     STA dat_00d5         ;         Set dat_00d5 = $ff
911d: 30 23                     BMI loc_9142         ;         Continue @ loc_9142
                                                     ;     End If
911f: ca        cont_911f       DEX                  ;     Subtract 1 from X
9120: 10 ef                     BPL loc_9111         ; Repeat while (X >= 0)
9122: 30 1e                     BMI loc_9142         ; Continue @ loc_9142

                ; Calculates player experience gain and handles level up if player's experience reaches the
                ;     necessary level.
                ;
                ; - Adds the minimum of dat_00a8_H/L and FoeHp_H/L to the player's experience points.
                ; - If the player's experience points exceed the experience needed to level up:
                ;    - ChrLvlUpExp = (ChrLvlUpExp * 2) - WIS
                ;    - Compute HP increase
                ;        DiceCount = min(ChrStaBase / 16, 8) + 1
                ;        DiceSides = 6 if ChrExpLevel < 2
                ;                      else 4 if ChrStaBase > 144
                ;                      else 3
                ;        DiceRoll = roll(DiceCount, DiceSides)
                ;        ChrHp = ChrHp + DiceRoll
                ;        ChrHpMax = ChrHpMax + DiceRoll
                ;    - Each stat base value is increased by a random amount from 1 to 3
                ;    - Increase treasure finding by random value from 0 to 2
                ;    - Increase player's level by 1
                ;
                ; Input
                ;   dat_00a8_H/L  - Big-endian uint16
                ;   FoeHp_H/L     - Foe's base HP as big-endian uint16
                ;
                ; Output
                ;   ChrExp0[0..3]      - Big-endian uint32 increased by min(dat_00a8_H/L, FoeHp_H/L)
                ;   ChrLvlUpExp0[0..3] - If level up occurred, big-endian uint32 value is multiplied by 2 and WIS is
                ;                        subtracted from the result.
                ;
9124: a5 a7     grantExp        LDA dat_00a7_H       ; Set
9126: 85 d4                     STA dat_00d4         ;     dat_00d4 = dat_00a7_H
9128: a5 a8                     LDA dat_00a8_L       ; Set
912a: 85 d5                     STA dat_00d5         ;     dat_00d5 = dat_00a8_L
912c: a5 a8                     LDA dat_00a8_L       ; Set C = 0
                                                     ; If (dat_00a8_L >= FoeHp_L) Then
912e: cd 23 aa                  CMP FoeHp_L          ;     Set C = 1
                                                     ; End If
9131: a5 a7                     LDA dat_00a7_H       ; If                       (seems to be: dat_00a8_H/L >= FoeHp_H/L)
9133: ed 22 aa                  SBC FoeHp_H          ;    (dat_00a7_H - FoeHp_H - ~C >= 0)
9136: 90 0a                     BCC loc_9142         ; Then
9138: ad 22 aa                  LDA FoeHp_H          ;     Set
913b: 85 d4                     STA dat_00d4         ;         dat_00d4 = FoeHp_H
913d: ad 23 aa                  LDA FoeHp_L          ;     Set
9140: 85 d5                     STA dat_00d5         ;         dat_00d5 = FoeHp_L
                                                     ; End If        (dat_00d4/5 = lesser of dat_00a8_H/L and FoeHp_H/L)
9142: 46 d4     loc_9142        LSR dat_00d4         ; Set dat_00d4 = dat_00d4 >> 1     (C = old bit 0)  (divide
9144: 66 d5                     ROR dat_00d5         ; Set dat_00d5 = dat_00d5 >> 1 | (C << 7)          dat_00d4/5 by 2)
                ; Add dat_00d4/dat_00d5 to ChrExp
9146: 18                        CLC                  ; Set
9147: a5 d5                     LDA dat_00d5         ;     ChrExp0
9149: 6d 40 63                  ADC ChrExp0          ;        =
914c: 8d 40 63                  STA ChrExp0          ;          ChrExp0 + dat_00d5
914f: a5 d4                     LDA dat_00d4         ; Set ChrExp1
9151: 6d 3f 63                  ADC ChrExp1          ;        =
9154: 8d 3f 63                  STA ChrExp1          ;          ChrExp1 + dat_00d4
9157: 90 08                     BCC loc_9161         ; If (C == 1) Then
9159: ee 3e 63                  INC ChrExp2          ;     Add 1 to ChrExp2
915c: d0 03                     BNE loc_9161         ;     If (ChrExp2 == 0) Then
915e: ee 3d 63                  INC ChrExp3          ;         Add 1 to ChrExp3
                                                     ;     End If
                                                     ; End If
9161: a2 00     loc_9161        LDX #$00             ; Set X = 0                   (check if exp pts > level up exp pts)
9163: bd 3d 63  loc_9163        LDA ChrExp3,X        ; Loop
9166: dd 41 63                  CMP ChrLvlUpExp3,X   ;     If (ChrExp3[X] > ChrLvlUpExp3[X]) Then
9169: f0 03                     BEQ loc_916e         ;         Exit Loop                (level up)
916b: b0 08                     BCS loc_9175         ;     Else if (ChrExp3[X] < ChrLvlUpExp3[X]) Then
916d: 60        loc_916d        RTS                  ;         Return to caller         (no level up)
                                                     ;     End If
916e: e8        loc_916e        INX                  ;     Add 1 to X
916f: e0 04                     CPX #$04             ; Repeat
9171: 90 f0                     BCC loc_9163         ;    while (X < 4)
9173: b0 f8                     BCS loc_916d         ; If (X >= 4) Then
                                                     ;     Return to caller             (values are equal, no level up)
                                                     ; End If
                ; Level up code past here
                ; ---
                ; Determine next level up experience needed: ChrLvlUpExp = (ChrLvlUpExp * 2) - WIS
9175: 18        loc_9175        CLC                  ; Set C = 0                        (multiply level up exp req by 2)
9176: a2 03                     LDX #$03             ; Set X = 3  (4 iterations [3..0])
9178: 3e 41 63  loc_9178        ROL ChrLvlUpExp3,X   ; Loop
                                                     ;     Set ChrLvlUpExp3[X]
                                                     ;            = (ChrLvlUpExp3[X] << 1) | C       (C = old bit 7)
917b: ca                        DEX                  ;     Subtract 1 from X
917c: 10 fa                     BPL loc_9178         ; Repeat while (X >= 0)
917e: 38                        SEC                  ; Set                                           (reduce by WIS)
917f: ad 44 63                  LDA ChrLvlUpExp0     ;     ChrLvlUpExp0
9182: ed 69 63                  SBC ChrWisCalc       ;        =
9185: 8d 44 63                  STA ChrLvlUpExp0     ;          ChrLvlUpExp0 - ChrWisCalc    (C = 0 on underflow else 1)
9188: a2 02                     LDX #$02             ; Set X = 2  (3 iterations [2..0])
918a: bd 41 63  loc_918a        LDA ChrLvlUpExp3,X   ; Loop
918d: e9 00                     SBC #$00             ;     Set
918f: 9d 41 63                  STA ChrLvlUpExp3,X   ;         ChrLvlUpExp3[X] = ChrLvlUpExp3[X] + C
9192: ca                        DEX                  ;     Subtract 1 from X
9193: 10 f5                     BPL loc_918a         ; Repeat while
                ; Compute HP increase
                ;   DiceCount = min(ChrStaBase / 16, 8) + 1
                ;   DiceSides = 6 if ChrExpLevel < 2
                ;                 else 4 if ChrStaBase > 144
                ;                 else 3
                ;   DiceRoll = roll(DiceCount, DiceSides)
                ;   ChrHp = ChrHp + DiceRoll
                ;   ChrHpMax = ChrHpMax + DiceRoll
9195: a0 03                     LDY #$03             ; Set Y = 3                                    (3 sides)
9197: ad 4a 63                  LDA ChrStaBase       ; Set
919a: 4a                        LSR                  ;     A
919b: 4a                        LSR                  ;       =
919c: 4a                        LSR                  ;         ChrStaBase >> 4
919d: 4a                        LSR                  ; If
919e: c9 09                     CMP #$09             ;    (A >= 9)
91a0: 90 03                     BCC loc_91a5         ; Then
91a2: a9 08                     LDA #$08             ;     Set A = 8                                (max 9 dice)
91a4: c8                        INY                  ;     Add 1 to Y                               (4 sides)
                                                     ; End If
91a5: 85 87     loc_91a5        STA DiceCount        ; Set
91a7: e6 87                     INC DiceCount        ;     DiceCount = A + 1
91a9: ae 3c 63                  LDX ChrExpLevel      ; Set X = ChrExpLevel
91ac: e0 02                     CPX #$02             ; If (X < 2)
91ae: b0 02                     BCS loc_91b2         ; Then
91b0: a0 06                     LDY #$06             ;     Set Y = 6                                (6 sides)
                                                     ; End If
91b2: 84 88     loc_91b2        STY DiceSides        ; Set DiceSides = Y
91b4: 20 aa 8f                  JSR rollDice         ; Call $8faa [rollDice]
91b7: ad 3c 63                  LDA ChrExpLevel      ; Set
91ba: 18                        CLC                  ;     DiceRoll_L
91bb: 65 7a                     ADC DiceRoll_L       ;        =
91bd: 85 7a                     STA DiceRoll_L       ;          DiceRoll_L + ChrExpLevel      (C = 1 on overflow else 0)
91bf: 90 02                     BCC loc_91c3         ; If (C == 1) Then
91c1: e6 7b                     INC DiceRoll_H       ;     Add 1 to DiceRoll_H
                                                     ; End If
91c3: 18        loc_91c3        CLC                  ; Set
91c4: a5 7a                     LDA DiceRoll_L       ;     ChrHp_L
91c6: 6d 46 63                  ADC ChrHp_L          ;        =
91c9: 8d 46 63                  STA ChrHp_L          ;          ChrHp_L + DiceRoll_L          (C = 1 on overflow else 0)
91cc: a5 7b                     LDA DiceRoll_H       ; Set ChrHp_H
91ce: 6d 45 63                  ADC ChrHp_H          ;        =
91d1: 8d 45 63                  STA ChrHp_H          ;          ChrHp_H + DiceRoll_H + C
91d4: 18                        CLC                  ; Set
91d5: a5 7a                     LDA DiceRoll_L       ;     ChrMaxHp_L
91d7: 6d 48 63                  ADC ChrMaxHp_L       ;        =
91da: 8d 48 63                  STA ChrMaxHp_L       ;          ChrMaxHp_L + DiceRoll_L       (C = 1 on overflow else 0)
91dd: a5 7b                     LDA DiceRoll_H       ; Set ChrMaxHp_H
91df: 6d 47 63                  ADC ChrMaxHp_H       ;        =
91e2: 8d 47 63                  STA ChrMaxHp_H       ;          ChrMaxHp_H + DiceRoll_H
                ; Calculate stat increases: Each stat base value is increased by a random amount from 1 to 3
91e5: a9 4a                     LDA #$4a             ; Set
91e7: 8d 95 a8                  STA dat_a895         ;     dat_a895 = $4a   ($4a -> $634a [ChrStaBase])
91ea: a9 07                     LDA #$07             ; Set
91ec: 85 96                     STA dat_0096         ;     dat_0096 = 7     (7 iterations [7..1])
91ee: a9 02     loc_91ee        LDA #$02             ; Loop
                                                     ;     Set A = 2
91f0: 20 99 18                  JSR j_randInRange    ;     Call $1899 [j_randInRange] (in A; out A [0..2])
91f3: 18                        CLC                  ;     Set
91f4: 69 01                     ADC #$01             ;         A = A + 1        (A = 1..3)
91f6: ae 95 a8                  LDX dat_a895         ;     Set X = dat_a895
91f9: 20 78 18                  JSR j_incChrAttr8    ;     Call $1878 [j_incChrAttr8] (in A, X)
91fc: a9 08                     LDA #$08             ;     Set
91fe: 18                        CLC                  ;         dat_a895
91ff: 6d 95 a8                  ADC dat_a895         ;            =
9202: 8d 95 a8                  STA dat_a895         ;              dat_a895 + 8      (next stat base offset)
9205: c6 96                     DEC dat_0096         ;     Subtract 1 from dat_0096
9207: d0 e5                     BNE loc_91ee         ; Repeat while (dat_0096 != 0)
                ; Increase treasure finding by 0..2
9209: a9 02                     LDA #$02             ; Set A = 2
920b: 20 99 18                  JSR j_randInRange    ; Call $1899 [j_randInRange] (in A; out A [0..2])
920e: a2 81                     LDX #$81             ; Set X = $81  ($6381 [ChrTreasureFnd])
9210: 20 78 18                  JSR j_incChrAttr8    ; Call $1878 [j_incChrAttr8] (in A, X)
                ; Finally, add the level
9213: ee 3c 63                  INC ChrExpLevel      ; Add 1 to ChrExpLevel
9216: 4c 61 91                  JMP loc_9161         ; Continue @ $9161 [loc_9161]

                ; Ensures that foe HP and corresponding ?? entries are arranged such that all entries with non-0 HP
                ;     are at the beginning of their respective tables.
                ;
                ; Output
                ;   FoeCount     - Updated to number of foes with HP > 0
                ;   dat_008a     - Updated to number of foes with HP > 0
                ;   dat_008b     - Updated to number of foes with HP > 0
                ;   FoeHpTbl_H/L - All entries in this table with a value greater than 0 are moved to the start of
                ;                  the table.
                ;   dat_00c2/dat_00c3 - If an entry in FoeHpTbl_H/L is moved, the corresponding entry in this table is
                ;                  also moved.
                ;
9219: ac 00 aa  sub_9219        LDY FoeCount         ; Set Y = FoeCount                (determine number of "live" foes)
921c: a2 00                     LDX #$00             ; Set X = 0
921e: 86 8b                     STX dat_008b         ; Set dat_008b = 0
9220: b5 b2     loc_9220        LDA FoeHpTbl_H,X     ; Loop
9222: 15 b3                     ORA FoeHpTbl_L,X     ;     If ((FoeHpTbl_H[X] | FoeHpTbl_L[X]) != 0)
9224: f0 02                     BEQ loc_9228         ;     Then
9226: e6 8b                     INC dat_008b         ;         Add 1 to dat_008b
                                                     ;     End If
9228: e8        loc_9228        INX                  ;     Set
9229: e8                        INX                  ;         X = X + 2
922a: 88                        DEY                  ;     Subtract 1 from Y
922b: d0 f3                     BNE loc_9220         ; Repeat while (Y != 0)
922d: a5 8b                     LDA dat_008b         ; Set
922f: 8d 00 aa                  STA FoeCount         ;     FoeCount = dat_008b
9232: 85 8a                     STA dat_008a         ; Set dat_008a = dat_008b
9234: f0 3b                     BEQ loc_9271         ; If (dat_008b != 0) Then
9236: a2 00                     LDX #$00             ;     Set X = 0
9238: b5 b2     loc_9238        LDA FoeHpTbl_H,X     ;     Loop
923a: 15 b3                     ORA FoeHpTbl_L,X     ;         If ((FoeHpTbl_H[X] | FoeHpTbl_L[X]) == 0)
923c: d0 2d                     BNE loc_926b         ;         Then
923e: 8a                        TXA                  ;             Set                   (Find next entry with non-0 HP)
923f: 18                        CLC                  ;                 Y
9240: 69 02                     ADC #$02             ;                   =
9242: a8                        TAY                  ;                     X + 2
9243: b9 b2 00  loc_9243        LDA FoeHpTbl_H,Y     ;             Loop
9246: 19 b3 00                  ORA FoeHpTbl_L,Y     ;                 If ((FoeHpTbl_H[Y] | FoeHpTbl_L[Y]) != 0) Then
9249: d0 04                     BNE loc_924f         ;                     Exit Loop
                                                     ;                 End If
924b: c8                        INY                  ;                 Set
924c: c8                        INY                  ;                     Y = Y + 2
924d: d0 f4                     BNE loc_9243         ;             Repeat while (Y != 0)
924f: b9 b2 00  loc_924f        LDA FoeHpTbl_H,Y     ;             Set                 (move values from idx Y to idx X)
9252: 95 b2                     STA FoeHpTbl_H,X     ;                 FoeHpTbl_H[X] = FoeHpTbl_H[Y]
9254: b9 b3 00                  LDA FoeHpTbl_L,Y     ;             Set
9257: 95 b3                     STA FoeHpTbl_L,X     ;                 FoeHpTbl_L[X] = FoeHpTbl_L[Y]
9259: b9 c2 00                  LDA dat_00c2,Y       ;             Set
925c: 95 c2                     STA dat_00c2,X       ;                 dat_00c2[X] = dat_00c2[Y]
925e: b9 c3 00                  LDA dat_00c3,Y       ;             Set
9261: 95 c3                     STA dat_00c3,X       ;                 dat_00c3[X] = dat_00c3[Y]
9263: a9 00                     LDA #$00             ;             Set
9265: 99 b2 00                  STA FoeHpTbl_H,Y     ;                 FoeHpTbl_H[Y] = 0
9268: 99 b3 00                  STA FoeHpTbl_L,Y     ;             Set FoeHpTbl_L[Y] = 0
                                                     ;         End If
926b: e8        loc_926b        INX                  ;         Set
926c: e8                        INX                  ;             X = X - 2
926d: c6 8b                     DEC dat_008b         ;         Subtract 1 from dat_008b
926f: d0 c7                     BNE loc_9238         ;     Repeat while (dat_008b != 0)
                                                     ; End If
9271: 60        loc_9271        RTS                  ; Return to caller

                ; Zeros the top nibble for all 16 entries in the DroppedGame list
                ;
9272: a2 0f     unlkDroppdItms  LDX #$0f             ; Set X = $0f (15)
9274: bd 94 64  loc_9274        LDA DroppedGame,X    ; Loop
9277: 29 0f                     AND #$0f             ;     Set
9279: 9d 94 64                  STA DroppedGame,X    ;         DroppedGame[X] = DroppedGame[X] & $0f
927c: ca                        DEX                  ;     Subtract 1 from X
927d: 10 f5                     BPL loc_9274         ; Repeat while (X >= 0)
927f: 60                        RTS                  ; Return to caller

                ; Waits for a vertical blank to occur
                ;
                ; Input
                ;   VBlankCounter - Repeatedly inspects this value until it changes (updated in VVBLKI)
                ;
                ; Note: X & Y registers are untouched by this sub
                ;
9280: ad 52 02  waitForVblankC  LDA VBlankCounter    ; Set A = VBlankCounter
9283: cd 52 02  loc_9283        CMP VBlankCounter    ; Loop until the
9286: f0 fb                     BEQ loc_9283         ;     VBlankCounter changes
9288: 60                        RTS                  ; Return to caller

                ; Populates the foe weapon properties given a foe weapon index in A.
                ;
                ; Input
                ;   A   - Foe weapon item index (0..2)
                ;
                ; Output
                ;   FoeWpnAddr_L/H  - Set to the item address
                ;   FoeWpnName_L/H  - Set to the item name
                ;   FoeWpnAtrs_L/H  - Set to the 3rd byte of the item attributes
                ;
9289: 0a        setFoeWeapon    ASL                  ; Set
928a: aa                        TAX                  ;     X = A << 1
928b: bd 05 aa                  LDA FoeWpnAdrs,X     ; Set
928e: 85 68                     STA FoeWpnAddr_L     ;     FoeWpnAddr_L/H
9290: bd 06 aa                  LDA FoeWpnAdrs,X+1   ;     to
9293: 85 69                     STA FoeWpnAddr_H     ;     FoeWpnAdrs[X..X+1]                                (item addr)
9295: 18                        CLC                  ; Set
9296: a5 68                     LDA FoeWpnAddr_L     ;     FoeWpnName_L
9298: 69 06                     ADC #$06             ;        =
929a: 85 6c                     STA FoeWpnName_L     ;          FoeWpnAddr_L + 6              (C = 1 on overflow else 0)
929c: a5 69                     LDA FoeWpnAddr_H     ; Set FoeWpnName_H
929e: 69 00                     ADC #$00             ;        =
92a0: 85 6d                     STA FoeWpnName_H     ;          FoeWpnAddr_H + C        (FoeWpnName_L/H = item name Zts)
92a2: a0 05                     LDY #$05             ; Set Y = 5
92a4: 18                        CLC                  ; Set
92a5: a5 68                     LDA FoeWpnAddr_L     ;     FoeWpnAtrs_L
92a7: 71 68                     ADC (FoeWpnAddr_L),Y ;        =                                 (C=1 on overflow else 0)
92a9: 85 6a                     STA FoeWpnAtrs_L     ;          FoeWpnAddr_L + (*FoeWpnAddr_L)[5]
92ab: a5 69                     LDA FoeWpnAddr_H     ; Set FoeWpnAtrs_H
92ad: 69 00                     ADC #$00             ;        =
92af: 85 6b                     STA FoeWpnAtrs_H     ;          FoeWpnAddr_H + C
92b1: a0 00                     LDY #$00             ; Set Y = 0
92b3: b1 6a     loc_92b3        LDA (FoeWpnAtrs_L),Y ; Loop
92b5: f0 0d                     BEQ loc_92c4         ;     If ((*FoeWpnAtrs_L)[0] != 0) Then
                                                     ;         Exit Loop                                (end of effects)
                                                     ;     End If
92b7: a5 6a                     LDA FoeWpnAtrs_L     ;     Set
92b9: 18                        CLC                  ;         FoeWpnAtrs_L
92ba: 69 10                     ADC #$10             ;            =
92bc: 85 6a                     STA FoeWpnAtrs_L     ;              FoeWpnAtrs_L + $10 (16)
92be: 90 02                     BCC loc_92c2         ;     If (C == 1) Then
92c0: e6 6b                     INC FoeWpnAtrs_H     ;         Add 1 to FoeWpnAtrs_H
                                                     ;     End If
92c2: d0 ef     loc_92c2        BNE loc_92b3         ; Repeat while (FoeWpnAtrs_H != 0)
92c4: a5 6a     loc_92c4        LDA FoeWpnAtrs_L     ; Set
92c6: 18                        CLC                  ;     FoeWpnAtrs_L
92c7: 69 03                     ADC #$03             ;        =
92c9: 85 6a                     STA FoeWpnAtrs_L     ;          FoeWpnAtrs_L + 3
92cb: 90 02                     BCC loc_92cf         ; If (C == 1) Then
92cd: e6 6b                     INC FoeWpnAtrs_H     ;     Add 1 to FoeWpnAtrs_H
                                                     ; End If
92cf: 60        loc_92cf        RTS                  ; Return to caller

                ; ? It looks like this is intended to add ?damage? to the HP of each foe. However, it just calculates
                ;   the low byte and doesn't actually update it. However, it does update the high byte if an overflow
                ;   would occur on the low byte. ?
                ;
                ; Input
                ;   dat_007d  -
                ;
92d0: a2 00     sub_92d0        LDX #$00             ; Set X = 0
92d2: ac 00 aa                  LDY FoeCount         ; Set Y = FoeCount
92d5: 18        loc_92d5        CLC                  ; Loop
92d6: a5 7d                     LDA dat_007d         ;     If                  (TODO: Bug? Is this supposed to update FoeHpTbl_L[X]?)
92d8: 75 b3                     ADC FoeHpTbl_L,X     ;        (dat_007d + FoeHpTbl_L[X] >= 256)
92da: 90 02                     BCC loc_92de         ;     Then
92dc: f6 b2                     INC FoeHpTbl_H,X     ;         Add 1 to FoeHpTbl_H[X]
                                                     ;     End If
92de: ad e8 63  loc_92de        LDA Chr_MagicalDmg   ;     If (Chr_MagicalDmg != 0) Then
92e1: f0 05                     BEQ loc_92e8         ;         Exit Loop
                                                     ;     End If
92e3: e8                        INX                  ;     Set
92e4: e8                        INX                  ;         X = X + 2
92e5: 88                        DEY                  ;     Subtract 1 from Y
92e6: d0 ed                     BNE loc_92d5         ; Repeat while (Y != 0)
92e8: 20 a7 8e  loc_92e8        JSR sub_8ea7         ; Call $8ea7 [sub_8ea7]
92eb: a5 7d                     LDA dat_007d         ; If (dat_007d != 0)
92ed: f0 07                     BEQ sub_92f6         ; Then
92ef: a2 9d                     LDX #$9d             ;     Set
92f1: a0 6d                     LDY #$6d             ;         Y/X = $9d6d [StrStrengthnd]
92f3: 20 d1 8e                  JSR dsplyMsg4Secs    ;     Call $8ed1 [dsplyMsg4Secs]   (in Y/X)
                                                     ; End If

                ;
                ; - Sums FoeLevel plus all 7 foe stats into UInt16Val_L/H
                ; - Divides the result by 8 (e.g. calculates the average)
                ; - Calls sub_8f15 with X = 3 and A = the calc'd avg
                ;
                ; Input
                ;   FoeLevel       -
                ;   FoeStats[0..6] -
                ;
92f6: ad 0d aa  sub_92f6        LDA FoeLevel         ; Set
92f9: 85 02                     STA UInt16Val_L      ;     UInt16Val_L = FoeLevel
92fb: a9 00                     LDA #$00             ; Set
92fd: 85 03                     STA UInt16Val_H      ;     UInt16Val_H = 0
92ff: a2 06                     LDX #$06             ; Set X = 6   (7 iterations [6..0])
9301: bd 24 aa  loc_9301        LDA FoeStats,X       ; Loop
                                                     ;     Set A = FoeStats[X]
9304: 20 5e 84                  JSR addByte16        ;     Call $845e [addByte16] (in A, out UInt16Val_L/H)
9307: ca                        DEX                  ;     Subtract 1 from X
9308: 10 f7                     BPL loc_9301         ; Repeat while (X >= 0)
930a: a2 03                     LDX #$03             ; Set X = 3                                (divide by 8)
930c: a5 02                     LDA UInt16Val_L      ; Set A = UInt16Val_L
930e: 46 03     loc_930e        LSR UInt16Val_H      ; Loop
                                                     ;     Set UInt16Val_H = UInt16Val_H >> 1   (C = old bit 0)
9310: 6a                        ROR                  ;     Set A = (A >> 1) | (C << 7)
9311: ca                        DEX                  ;     Subtract 1 from X
9312: d0 fa                     BNE loc_930e         ; Repeat while (X != 0)
9314: a2 03                     LDX #$03             ; Set X = 3
9316: 4c 15 8f                  JMP sub_8f15         ; Continue @ $8f15 [sub_8f15] (in A, X)

                ;
                ; Input
                ;   A       -
                ;   FoeNum  - Current foe number
                ;
9319: 85 a8     sub_9319        STA dat_00a8_L       ; Set dat_00a8_L = A
931b: a9 00                     LDA #$00             ; Set
931d: 85 a7                     STA dat_00a7_H       ;     dat_00a7_H = 0
931f: 20 09 95                  JSR sub_9509         ; Call $9509 [sub_9509] (in FoeNum; out X, C=0)
9322: b5 b3                     LDA FoeHpTbl_L,X     ; Set FoeHpTbl_L[X]
9324: e5 a8                     SBC dat_00a8_L       ;        =
9326: 95 b3                     STA FoeHpTbl_L,X     ;          FoeHpTbl_L[X] - dat_00a8_L - ~C      (C=1 on underflow)
9328: b5 b2                     LDA FoeHpTbl_H,X     ; Set FoeHpTbl_H[X]
932a: e5 a7                     SBC dat_00a7_H       ;        =
932c: 95 b2                     STA FoeHpTbl_H,X     ;          FoeHpTbl_H[X] - dat_00a7_H - ~C      (C=1 on underflow)
932e: b0 06                     BCS loc_9336         ; If (C == 0) Then                            (underflow occurred)
9330: a9 00                     LDA #$00             ;     Set
9332: 95 b3                     STA FoeHpTbl_L,X     ;         FoeHpTbl_L[X] = 0
9334: 95 b2                     STA FoeHpTbl_H,X     ;     Set FoeHpTbl_H[X] = 0
                                                     ; End If
9336: 60        loc_9336        RTS                  ; Return to caller

                ;
                ; - Displays the "cast the spell of" message
                ; - Waits for 1/2 second
                ;
                ; Input
                ;   A  - Foe spell number (0..11)
                ;           0: Protection     3: Finger Of Death  6: Cold Cone         9: Suffocation
                ;           1: Strength       4: Paralysis        7: Lightning        10: Repulsion
                ;           2: Agility        5: Fireball         8: Mind Flail       11: Blink
                ;
                ; Output
                ;   dat_a89f - Set to the input value of A
                ;
                ; Temp
                ;   GrbItemName_L/H - Set to the spell name
                ;   GenderZts_L/H   - Set to ZtsBlank
                ;
9337: 8d 9f a8  sub_9337        STA dat_a89f         ; Set dat_a89f = A
933a: aa                        TAX                  ; Set X = A
933b: bd 72 a5                  LDA SpellNames_L,X   ; Set
933e: 8d d9 76                  STA GrbItemName_L    ;     GrbItemName_L = SpellNames_L[X]
9341: bd 7e a5                  LDA SpellNames_H,X   ; Set
9344: 8d da 76                  STA GrbItemName_H    ;     GrbItemName_H = SpellNames_H[X]
9347: a9 df                     LDA #$df             ; Set
9349: 8d db 76                  STA GenderZts_L      ;     GenderZts_L/H
934c: a9 76                     LDA #$76             ;     to
934e: 8d dc 76                  STA GenderZts_H      ;     $76df [ZtsBlank]
9351: a2 a2                     LDX #$a2             ; Set
9353: a0 35                     LDY #$35             ;     Y/X = $a235 [StrCasts]
9355: 20 ef 8e                  JSR dsplyTmpltStr    ; Call $8eef [dsplyTmpltStr] (in Y/X)

                ; Waits for 30 vertical blanks (approx. 1/2 second)
                ;
                ; Output
                ;   A     - unmodified
                ;   X     - unmodified
                ;   Y     - unmodified
                ;
9358: 48        waitHalfSec     PHA                  ; Push A to the stack
9359: 8a                        TXA                  ; Push X to
935a: 48                        PHA                  ;     the stack
935b: a2 1e                     LDX #$1e             ; Set X = $1e (30)
935d: 20 80 92  loc_935d        JSR waitForVblankC   ; Loop
                                                     ;     Call $9280 [waitForVblankC]
9360: ca                        DEX                  ;     Subtract 1 from X
9361: d0 fa                     BNE loc_935d         ; Repeat while (X != 0)
9363: 68                        PLA                  ; Restore X
9364: aa                        TAX                  ;     from the stack
9365: 68                        PLA                  ; Restore A from the stack
9366: 60                        RTS                  ; Return to caller

                ; Displays "casts ... but it fails" message
                ;
                ; Input
                ;   dat_a89f - Foe spell number (0..11)
                ;                 0: Protection     3: Finger Of Death  6: Cold Cone         9: Suffocation
                ;                 1: Strength       4: Paralysis        7: Lightning        10: Repulsion
                ;                 2: Agility        5: Fireball         8: Mind Flail       11: Blink
                ;
9367: ae 9f a8  cont_9367       LDX dat_a89f         ; Set X = dat_a89f
936a: bd 81 93                  LDA tbl_9381,X       ; Set A = tbl_9381[X]
936d: 20 19 93                  JSR sub_9319         ; Call $9319 [sub_9319]
9370: a9 27                     LDA #$27             ; Set
9372: 8d db 76                  STA GenderZts_L      ;     GenderZts_L/H
9375: a9 a2                     LDA #$a2             ;     to
9377: 8d dc 76                  STA GenderZts_H      ;     $a227 [ZtsButItFails]
937a: a2 a2                     LDX #$a2             ; Set
937c: a0 35                     LDY #$35             ;     Y/X = $a235 [StrCasts]
937e: 4c ce 8e                  JMP dsplyMsg2Secs    ; Continue @ $8ece [dsplyMsg2Secs]   (in Y/X)

9381: 00 01 01  tbl_9381        .BYTE $00,$01,$01                      ;
9384: 01 02 02 02 02 02 02 02   .BYTE $01,$02,$02,$02,$02,$02,$02,$02  ;
938c: 01                                                               ;

                ; Computes foe attack damage to the player.
                ;
                ; - Each of Chr_BluntDmg[0..11] are decreased by the corresponding ChrResist[0..11] to a min of 0
                ; - If the player has armor equipped for the body part attacked
                ;    - The armor's affects for each damage type are calculated
                ;      - If the armor's protection value is:
                ;        - $ff - all damage is negated (invulnerable to this type of attack)
                ;        - If high nibble is 0, item is weak to that damage type and damage is DOUBLED
                ;        - If low nibble is 0, item converts damage to HP and heals the player instead
                ;        - Otherwise: high nibble = number of dice, low nibble = number of sides per die
                ;          - Damage is reduced by the amount rolled
                ;    - If any damage is dealt to the player
                ;      - There is a 50% chance of the armor's durability being decreased by a random value in the
                ;        range [0..3] (or [0..6] if dat_00a4 is != 0)
                ;
                ; Input
                ;   dat_00a4       - If non-0, the range used for any armor durability decrease is doubled from 3 to 6
                ;   dat_a89c       - Part of the player's body the attack targeted
                ;                      0: Head, 1: Body, 2: Arms, 3: Legs
                ;   ChrArmor       - The stats of equipped armor for the attacked body part are applied to
                ;                    reduce/adjust the corresponding entry in Chr_BluntDmg[0..10]
                ;   ChrResist[0..10] - Each intrinsic character resistance stat is used to reduce/adjust the
                ;                    corresponding entry in Chr_BluntDmg[0..10]
                ;   Chr_BluntDmg[0..10] - Initial damage values for each type of damage.
                ;
                ; Output
                ;   Chr_BluntDmg[0..10] - Updated damage values adjusted based on the ChrResist and ChrArmor values.
                ;
                ; Temp
                ;   dat_007e  - used to calculate any HP gain from attack
                ;   dat_008b  - used as loop control var for iterating damage/protection types
                ;
938d: a0 0a     calcFoeAtkDmg   LDY #$0a             ; Set Y = $a (11 iterations [10..0])
938f: b9 dd 63  loc_938f        LDA Chr_BluntDmg,Y   ; Loop
9392: 38                        SEC                  ;     Set
9393: f9 a6 63                  SBC ChrResist,Y      ;         A = Chr_BluntDmg[Y] - ChrResist[Y]
9396: b0 02                     BCS loc_939a         ;     If (C == 0) Then    (underflow)
9398: a9 00                     LDA #$00             ;         Set A = 0
                                                     ;     End If
939a: 99 dd 63  loc_939a        STA Chr_BluntDmg,Y   ;     Set Chr_BluntDmg[Y] = A
939d: 88                        DEY                  ;     Subtract 1 from Y
939e: 10 ef                     BPL loc_938f         ; Repeat while (Y >= 0)
93a0: ae 9c a8                  LDX dat_a89c         ; Set X = dat_a89c
93a3: bd 93 a3                  LDA AtYourDescs_L,X  ; Set
93a6: 8d db 76                  STA GenderZts_L      ;     GenderZts_L/H
93a9: bd 97 a3                  LDA AtYourDescs_H,X  ;     to
93ac: 8d dc 76                  STA GenderZts_H      ;     AtYourDescs_L/H[X]
93af: bd 9e 63                  LDA ChrArmor,X       ; If (ChrArmor[X] < 0) Then        (no armor equipped on that area)
93b2: 10 03                     BPL loc_93b7         ;     Return to caller             (@ $93b7)
93b4: 4c 74 94                  JMP loc_9474         ; End If
93b7: 85 4b     loc_93b7        STA ItemIndex        ; Set ItemIndex = ChrArmor[X]
93b9: 20 87 18                  JSR j_getItemAdr     ; Call $1887 [j_getItemAdr]
93bc: 20 96 18                  JSR j_getItemAttrs   ; Call $1896 [j_getItemAttrs]
93bf: e6 43                     INC ItemAttrs_L      ; Add 1 to ItemAdr_L               (skip armor type byte)
93c1: d0 02                     BNE loc_93c5         ; If (ItemAdr_L == 0) Then
93c3: e6 44                     INC ItemAttrs_H      ;     Add 1 to ItemAttrs_H
                                                     ; End If
93c5: 18        loc_93c5        CLC                  ; Set
93c6: a9 06                     LDA #$06             ;     dat_0070_L
93c8: 65 41                     ADC ItemAdr_L        ;        =
93ca: 85 70                     STA dat_0070_L       ;          ItemAdr_L + 6           (C = 1 on overflow else 0)
93cc: a5 42                     LDA ItemAdr_H        ; Set dat_0070_H
93ce: 69 00                     ADC #$00             ;        =
93d0: 85 71                     STA dat_0070_H       ;          ItemAdr_H + C
93d2: a9 00                     LDA #$00             ; Set
93d4: 85 7e                     STA dat_007e         ;     dat_007e = 0
93d6: a9 0a                     LDA #$0a             ; Set
93d8: 85 8b                     STA dat_008b         ;     dat_008b = $a (10)
93da: a4 8b     loc_93da        LDY dat_008b         ; Loop
                                                     ;     Set Y = dat_008b
93dc: b9 dd 63                  LDA Chr_BluntDmg,Y   ;     If (Chr_BluntDmg[Y] != 0)
93df: f0 37                     BEQ loc_9418         ;        And
93e1: b1 43                     LDA (ItemAttrs_L),Y  ;        ((*ItemAttrs_L)[Y] != 0)
93e3: f0 33                     BEQ loc_9418         ;     Then
93e5: c9 ff                     CMP #$ff             ;         If ((*ItemAttrs_L)[Y] == $ff) Then     (invulnerable)
93e7: f0 18                     BEQ loc_9401         ;             Set Chr_BluntDmg[Y] = 0            (@ $9401)
                                                     ;         Else
93e9: c9 10                     CMP #$10             ;             If ((*ItemAttrs_L)[Y] < $10)
93eb: b0 08                     BCS loc_93f5         ;             Then                               (double damage)
93ed: a6 8b                     LDX dat_008b         ;                 Set X = dat_008b               (Coulda used Y...)
93ef: 1e dd 63                  ASL Chr_BluntDmg,X   ;                 Set Chr_BluntDmg[X] = Chr_BluntDmg[X] << 1
                                                     ;                                      (Bug? no overflow check...)
93f2: 4c 18 94                  JMP loc_9418         ;             Else If
93f5: 29 0f     loc_93f5        AND #$0f             ;                (((*ItemAttrs_L)[Y] & $0f) == 0)
93f7: d0 0f                     BNE loc_9408         ;             Then                               (damage -> HP)
93f9: 18                        CLC                  ;                 Set
93fa: b9 dd 63                  LDA Chr_BluntDmg,Y   ;                     dat_007e
93fd: 65 7e                     ADC dat_007e         ;                        =             (Bug? no overflow check...)
93ff: 85 7e                     STA dat_007e         ;                          dat_007e + Chr_BluntDmg[Y]
9401: a9 00     loc_9401        LDA #$00             ;                 Set
9403: 99 dd 63                  STA Chr_BluntDmg,Y   ;                     Chr_BluntDmg[Y] = 0
9406: f0 10                     BEQ loc_9418         ;             Else
9408: b1 43     loc_9408        LDA (ItemAttrs_L),Y  ;                 Set A = (*ItemAttrs_L)[Y]
940a: 20 8e 8f                  JSR rollDiceA        ;                 Call $8f8e [rollDiceA]
                                                     ;                          (in A; out DiceRoll_L/H; X, Y unchanged)
940d: 38                        SEC                  ;                 Set A
940e: b9 dd 63                  LDA Chr_BluntDmg,Y   ;                       =
9411: e5 7a                     SBC DiceRoll_L       ;                         Chr_BluntDmg[Y] - DiceRoll_L
9413: 90 ec                     BCC loc_9401         ;                 If (C == 0) Then   (underflow)
                                                     ;                     Set Chr_BluntDmg[Y] = 0        (@ $9401)
                                                     ;                 Else
9415: 99 dd 63                  STA Chr_BluntDmg,Y   ;                     Set Chr_BluntDmg[Y] = A
                                                     ;                 End If
                                                     ;             End If
                                                     ;         End If
                                                     ;     End If
9418: c6 8b     loc_9418        DEC dat_008b         ;     Subtract 1 from dat_008b
941a: 10 be                     BPL loc_93da         ; Repeat while (dat_008b >= 0)
                ; Apply any accumulated HP gain
941c: a5 7e                     LDA dat_007e         ; Set A = dat_007e
941e: f0 09                     BEQ loc_9429         ; If (A != 0) Then
9420: a2 45                     LDX #$45             ;     Set X = $45 ($6345 [ChrHp_H])
9422: 20 7b 18                  JSR j_incChrAttr16   ;     Call $187b [j_incChrAttr16]
9425: a2 a2                     LDX #$a2             ;     Set
9427: a0 a1                     LDY #$a1             ;         Y/X = $a2a1 [StrFlStrngthnd]       (Bug: seems this was
                                                     ; End If                                       meant to be output?)
                ; If any damage dealt, determine amount of durability to take away from the armor
9429: a2 0a     loc_9429        LDX #$0a             ; Set X = $a (10)
942b: a9 00                     LDA #$00             ; Set A = 0
942d: 1d dd 63  loc_942d        ORA Chr_BluntDmg,X   ; Loop
                                                     ;     Set A = A | Chr_BluntDmg[X]
9430: ca                        DEX                  ;     Subtract 1 from X
9431: 10 fa                     BPL loc_942d         ; Repeat while (X >= 0)
9433: c9 00                     CMP #$00             ; If
9435: f0 3d                     BEQ loc_9474         ;    (A != 0)                               (some damage dealt)
9437: ad 0a d2                  LDA RANDOM           ;    And
943a: c9 40                     CMP #$40             ;    (random byte < $40 (64))               (25% chance)
943c: b0 36                     BCS loc_9474         ; Then
943e: a9 03                     LDA #$03             ;     Set A = 3
9440: a4 a4                     LDY dat_00a4         ;     Set Y = dat_00a4
9442: f0 01                     BEQ loc_9445         ;     If (Y != 0) Then
9444: 0a                        ASL                  ;         Set A = 6
                                                     ;     End If
9445: 20 99 18  loc_9445        JSR j_randInRange    ;     Call $1899 [j_randInRange] (in A; out A)
9448: 8d 55 94                  STA smc_9454+1       ;     Set smc_9454[1] = A
944b: a0 0b                     LDY #$0b             ;     Set Y = $b (11)
944d: b1 43                     LDA (ItemAttrs_L),Y  ;     If
944f: c9 ff                     CMP #$ff             ;        ((*ItemAttrs_L)[11] != $ff)        (not unbreakable)
9451: f0 21                     BEQ loc_9474         ;     Then
9453: 38                        SEC                  ;         Set (*ItemAttrs_L)[11]
9454: e9 ff     smc_9454        SBC #$ff             ;                  =
9456: 91 43                     STA (ItemAttrs_L),Y  ;                    (*ItemAttrs_L)[11] - smc_9454[1]
9458: 90 02                     BCC loc_945c         ;         If (C == 0)    (underflow)
945a: d0 0d                     BNE loc_9469         ;            Or ((*ItemAttrs_L)[11] == 0)
                                                     ;         Then
945c: a0 02     loc_945c        LDY #$02             ;             Set Y = 2
945e: a9 10                     LDA #$10             ;             Set
9460: 91 41                     STA (ItemAdr_L),Y    ;                 (*ItemAdr_L)[2] = $10 (16)
9462: a2 a2                     LDX #$a2             ;             Set
9464: a0 eb                     LDY #$eb             ;                 Y/X = $a2eb [StrHasBroken2]
9466: 4c 7f 8e                  JMP shwMsgAndUpdt    ;             Continue @ $8e7f [shwMsgAndUpdt] (in Y/X)
                                                     ;         Else If
9469: c9 04     loc_9469        CMP #$04             ;            ((*ItemAttrs_L)[11] < 4)
946b: b0 07                     BCS loc_9474         ;         Then
946d: a2 a2                     LDX #$a2             ;             Set
946f: a0 cd                     LDY #$cd             ;                 Y/X = $a2cd [StrWeakening]
9471: 4c 7f 8e                  JMP shwMsgAndUpdt    ;             Continue @ $8e7f [shwMsgAndUpdt] (in Y/X)
                                                     ;         End If
                                                     ;     End If
                                                     ; End If
9474: 60        loc_9474        RTS                  ; Return to caller

                ;
                ;
                ;
9475: 18        sub_9475        CLC                  ; Set
9476: ad 71 63                  LDA ChrSklCalc       ;     A
9479: 6d 49 63                  ADC ChrStaCalc       ;       =
947c: 6a                        ROR                  ;         (ChrSklCalc + ChrStaCalc) / 2           (avg)
947d: a2 05                     LDX #$05             ; Set X = 5
947f: 4c 0d 8f                  JMP sub_8f0d         ; Continue @ $8f0d [sub_8f0d] (in A, X)

                ; Sets dat_00ac to $40 if bit 7 of dat_00ab is set and $c0 otherwise.
                ;
                ; Output
                ;   dat_00ac  - (dat_00ab < 0) ? $40 : $c0
                ;
9482: a9 40     sub_9482        LDA #$40             ; Set A = $40
9484: 24 ab                     BIT dat_00ab         ; If (dat_00ab >= 0)
9486: 30 02                     BMI loc_948a         ; Then
9488: a9 c0                     LDA #$c0             ;     Set A = $c0
                                                     ; End If
948a: 85 ac     loc_948a        STA dat_00ac         ; Set dat_00ac
948c: 60                        RTS                  ; Return to caller

                ;
                ; - Clears bit 6 of Foe_aa21
                ; - If dat_00ab == 0
                ;
                ; Input
                ;   dat_00ab  -
                ;   dat_00ac  -
                ;
                ; Output
                ;   Foe_aa21  - Bit 6 is cleared
                ;   dat_00ab  - Updated if 0 on input
                ;
948d: ad 21 aa  sub_948d        LDA Foe_aa21         ; Set Foe_aa21
9490: 29 bf                     AND #$bf             ;        =
9492: 8d 21 aa                  STA Foe_aa21         ;          Foe_aa21 & $bf (1011_1111 - clear bit 6)
9495: a5 ab                     LDA dat_00ab         ; If (dat_00ab == 0)
9497: d0 2b                     BNE loc_94c4         ; Then
9499: a2 40                     LDX #$40             ;     Set X = $40 (64)
949b: ad 21 aa                  LDA Foe_aa21         ;     If
949e: 29 7f                     AND #$7f             ;        (((Foe_aa21 & $7f) | dat_00ac) == 0)
94a0: 05 ac                     ORA dat_00ac         ;
94a2: d0 0e                     BNE loc_94b2         ;     Then
94a4: ad 0a d2                  LDA RANDOM           ;         If (random byte < 0)
94a7: 10 07                     BPL loc_94b0         ;         Then
94a9: a9 01                     LDA #$01             ;             Set A = 1
94ab: a2 85                     LDX #$85             ;             Set X = $85  ($6385 [ChrAlign])
94ad: 20 6f 18                  JSR j_decChrAttr8    ;             Call $186f [j_decChrAttr8] (in X, A)
                                                     ;         End If
94b0: a2 80     loc_94b0        LDX #$80             ;         Set X = $80
                                                     ;     End If
94b2: 86 ab     loc_94b2        STX dat_00ab         ;     Set dat_00ab = X             (either $40 or $80)
94b4: ad 9c 63                  LDA ChrPriWeapon     ;     Set A = ChrPriWeapon
94b7: 30 03                     BMI loc_94bc         ;     If (A >= 0) Then
94b9: 20 8d 18                  JSR j_chkItemAtAlign ;         Call $188d [j_chkItemAtAlign] (in A)
                                                     ;     End If
94bc: ad 9d 63  loc_94bc        LDA ChrSecWeapon     ;     Set A = ChrSecWeapon
94bf: 30 03                     BMI loc_94c4         ;     If (A >= 0) Then
94c1: 20 8d 18                  JSR j_chkItemAtAlign ;         Call $188d [j_chkItemAtAlign] (in A)
                                                     ;     End If
                                                     ; End If
94c4: 60        loc_94c4        RTS                  ; Return to caller

                ;
                ;
                ; Input
                ;   FoeNum   -
                ;
                ; Output
                ;   C        - 1 if the foe's HP was 0 otherwise 0
                ;
94c5: 20 09 95  sub_94c5        JSR sub_9509         ; Call $9509 [sub_9509] (in FoeNum; out X, C=0)
94c8: b5 b2                     LDA FoeHpTbl_H,X     ; If
94ca: 15 b3                     ORA FoeHpTbl_L,X     ;    ((FoeHpTbl_H[X] | FoeHpTbl_L[X])  == 0)
94cc: d0 05                     BNE loc_94d3         ; Then
94ce: 20 cf 84                  JSR sub_84cf         ;     Call $84cf [sub_84cf]
94d1: 38                        SEC                  ;     Set C = 1
94d2: 24        nop_94d2        .BYTE $24            ; Else           (Forms `BIT $18` (NOP) with next byte to skip CLC)
94d3: 18        loc_94d3        CLC                  ;     Set C = 0
                                                     ; End If
94d4: 60                        RTS                  ; Return to caller

                ;
                ; Input
                ;   A        - base value
                ;
                ; Output
                ;   dat_0096 - input value of A plus a random value between 0 and 40
                ;   A        - random byte
                ;   Z        - 1 if A == dat_0096 else 0
                ;   N        - 1 if A < dat_0096 else 0
                ;   C        - 1 if A >= dat_0096 else 0
                ;
94d5: 85 96     sub_94d5        STA dat_0096         ; Set dat_0096 = A
94d7: a9 28                     LDA #$28             ; Set A = $28 (40)
94d9: 20 99 18                  JSR j_randInRange    ; Call $1899 [j_randInRange] (in A; out A [0..40])
94dc: 18                        CLC                  ; Set dat_0096
94dd: 65 96                     ADC dat_0096         ;        =
94df: 85 96                     STA dat_0096         ;          dat_0096 + A
94e1: ad 0a d2                  LDA RANDOM           ; Set A = random byte
94e4: c5 96                     CMP dat_0096         ; Set Z = 1 if A == dat_0096 else 0
                                                     ; Set N = 1 if A < dat_0096 else 0
                                                     ; Set C = 1 if A >= dat_0096 else 0
94e6: 60                        RTS                  ; Return to caller

                ; Continues execution at the address in X/A.
                ;
                ; Input
                ;    X - LSB of address to continue execution at
                ;    A - MSB of address to continue execution at
                ;
94e7: 8e ee 94  contAtAddrXA    STX smc_94ed+1       ; Set smc_94ed[1] = X
94ea: 8d ef 94                  STA smc_94ed+2       ; Set smc_94ed[2] = A
94ed: 4c ff ff  smc_94ed        JMP $ffff            ; Continue @ address in smc_94ed[1..2]

                ; Sets bit 7 on all entries of DroppedGame
                ;
94f0: a2 0f     lockDroppdItms  LDX #$0f             ; Set X = $f (16 iterations [15..0])
94f2: bd 94 64  loc_94f2        LDA DroppedGame,X    ; Loop
94f5: 09 80                     ORA #$80             ;     Set
94f7: 9d 94 64                  STA DroppedGame,X    ;         DroppedGame[X] = DroppedGame[X] + $80
94fa: ca                        DEX                  ;     Subtract 1 from X
94fb: 10 f5                     BPL loc_94f2         ; Repeat while (X >= 0)
94fd: 60                        RTS                  ; Return to caller

                ; Tests if bit 1 of the CurZoneFlags is set
                ;
                ; Output
                ;   C    - 1 if bit 1 of the CurZoneFlags is set, else 0
                ;
94fe: ad 4d 19  isZoneFlag1Set  LDA CurZoneFlags     ; If
9501: 29 02                     AND #$02             ;    ((CurZoneFlags & 2) != 0)
9503: f0 02                     BEQ loc_9507         ; Then
9505: 38                        SEC                  ;     Set C = 1
9506: 24        nop_9506        .BYTE $24            ; Else           (Forms `BIT $18` (NOP) with next byte to skip CLC)
9507: 18        loc_9507        CLC                  ;     Set C = 0
                                                     ; End If
9508: 60                        RTS                  ; Return to caller

                ;
                ; Input
                ;   FoeNum - Current foe number (0..7)
                ;
                ; Output
                ;    X     - Set to FoeNum << 1 (e.g. index into array of 2-byte entries)
                ;    C     - Set to 0
                ;
9509: a5 76     sub_9509        LDA FoeNum           ; Set X
950b: 0a                        ASL                  ;       = FoeNum << 1
950c: aa                        TAX                  ; Set C = 0               (as long as FoeNum < 128 ;)
950d: 60                        RTS                  ; Return to caller

                ;
                ; Input
                ;   dat_008d
                ;
                ; Output
                ;   dat_0062    - 0
                ;   dat_0063    -
                ;   Y           - 0
                ;
                ; ???
                ;   dat_025a      -
                ;   SourceAdr_L/H -
                ;   DestAdr_L/H   -
                ;
950e: 20 27 18  sub_950e        JSR j_resetIO        ; Loop
                                                     ;     Call $1827 [j_resetIO]
9511: a9 80                     LDA #$80             ;     Set
9513: 8d 5a 02                  STA dat_025a         ;         dat_025a = $80
9516: a9 97                     LDA #$97             ;     Set
9518: 85 07                     STA SourceAdr_L      ;         SourceAdr_L/H
951a: a9 ac                     LDA #$ac             ;         to
951c: 85 08                     STA SourceAdr_H      ;         $ac97 [dat_ac97]
951e: a5 8d                     LDA dat_008d         ;     Set
9520: 85 96                     STA dat_0096         ;         dat_0096 = dat_008d
9522: 20 ea 96                  JSR sub_96ea         ;     Call $96ea [sub_96ea] (in dat_0096, SourceAdr_L/H; out dat_00d6/dat_00d7)
9525: a9 ec                     LDA #$ec             ;     Set
9527: 8d 32 02                  STA DiskSector_L     ;         DiskSector_L/H
952a: a9 00                     LDA #$00             ;         to
952c: 8d 33 02                  STA DiskSector_H     ;         $00ec (236)
952f: a9 00                     LDA #$00             ;     Set
9531: 85 09                     STA DestAdr_L        ;         DestAdr_L/H
9533: a9 aa                     LDA #$aa             ;         to
9535: 85 0a                     STA DestAdr_H        ;         $aa00 [FoeData]
9537: 20 2b 96                  JSR sub_962b         ;     Call $962b [sub_962b]
953a: 90 06                     BCC loc_9542         ;     If (C == 1) Then
                                                     ;         Exit Loop
                                                     ;     End If
953c: 20 1c 96                  JSR sub_961c         ;     Call $961c [sub_961c]
953f: 4c 0e 95                  JMP sub_950e         ; Repeat while (true)
9542: a0 00     loc_9542        LDY #$00             ; Set Y = 0
9544: a6 0a                     LDX DestAdr_H        ; Set X = DestAdr_H
9546: a5 09                     LDA DestAdr_L        ; Set A = DestAdr_L
9548: f0 01                     BEQ loc_954b         ; If (A != 0) Then
954a: e8                        INX                  ;     Add 1 to X
                                                     ; End If
954b: 84 62     loc_954b        STY dat_0062         ; Set dat_0062 = Y   (0)
954d: 86 63                     STX dat_0063         ; Set dat_0063 = X
954f: 60                        RTS                  ; Return to caller

                ;
                ;
                ;
9550: a9 a1     sub_9550        LDA #$a1             ; Loop
                                                     ;     Set
9552: 85 07                     STA SourceAdr_L      ;         SourceAdr_L/H
9554: a9 a8                     LDA #$a8             ;         to
9556: 85 08                     STA SourceAdr_H      ;         $a8a1 [dat_a8a1]
9558: ad 1d aa                  LDA FoePicture_L     ;     Set
955b: 85 96                     STA dat_0096         ;         dat_0096 = FoePicture_L
955d: 20 ea 96                  JSR sub_96ea         ;     Call $96ea [sub_96ea]
9560: a9 80                     LDA #$80             ;     Set
9562: 8d 32 02                  STA DiskSector_L     ;         DiskSector_L/H
9565: a9 01                     LDA #$01             ;         to
9567: 8d 33 02                  STA DiskSector_H     ;         $0180 (384)
956a: a5 62                     LDA dat_0062         ;     Set
956c: 85 09                     STA DestAdr_L        ;         DestAdr_L/H
956e: a5 63                     LDA dat_0063         ;         to
9570: 85 0a                     STA DestAdr_H        ;         dat_0062/dat_0061
9572: 20 2b 96                  JSR sub_962b         ;     Call $962b [sub_962b]
9575: 90 09                     BCC loc_9580         ;     If (C == 0) Then
                                                     ;         Exit Loop
                                                     ;     End If
9577: 20 1c 96                  JSR sub_961c         ;     Call $961c [sub_961c]
957a: 20 27 18                  JSR j_resetIO        ;     Call $1827 [j_resetIO]
957d: 4c 50 95                  JMP sub_9550         ; Repeat while (true)
9580: a9 00     loc_9580        LDA #$00             ; Set A = 0
9582: aa                        TAX                  ; Set X = 0  (256 iterations [0, 255..1])
9583: 9d 00 bc  loc_9583        STA bc00,X           ; Loop                               (zero 1KB from $bc00 to $bfff)
                                                     ;     Set bc00[X] = 0
9586: 9d 00 bd                  STA bc00+256,X       ;     Set bc00[256 + X] = 0
9589: 9d 00 be                  STA bc00+512,X       ;     Set bc00[512 + X] = 0
958c: 9d 00 bf                  STA bc00+768,X       ;     Set bc00[768 + X] = 0
958f: ca                        DEX                  ;     Subtract 1 from X
9590: d0 f1                     BNE loc_9583         ; Repeat while (X != 0)
9592: a2 03                     LDX #$03             ; Set X = 3
9594: 9d 08 d0  loc_9594        STA SIZEP0,X         ; Loop
                                                     ;     Set SIZEP0[X]
9597: ca                        DEX                  ;     Subtract 1 from X
9598: 10 fa                     BPL loc_9594         ; Repeat while (X >= 0)
959a: a9 b8                     LDA #$b8             ; Set
959c: 8d 07 d4                  STA PMBASE           ;     PMBASE = $b8
959f: a9 02                     LDA #$02             ; Set
95a1: 8d 1d d0                  STA GRACTL           ;     GRACTL = 2
95a4: a9 31                     LDA #$31             ; Set
95a6: 8d 1b d0                  STA PRIOR            ;     PRIOR = $31
95a9: a0 00                     LDY #$00             ; Set Y = 0
95ab: 84 d2                     STY dat_00d2         ; Set dat_00d2 = 0
95ad: b1 62                     LDA (dat_0062),Y     ; Set
95af: 8d 71 98                  STA dat_9871         ;     dat_9871 = (*dat_0062)[0]
95b2: a5 63                     LDA dat_0063         ; Set
95b4: 8d 77 98                  STA dat_9877         ;     dat_9877 = dat_0063
95b7: 18        loc_95b7        CLC                  ; Loop
95b8: b9 71 98                  LDA dat_9871,Y       ;     Set dat_9872[Y]
95bb: 69 f0                     ADC #$f0             ;            =
95bd: 99 72 98                  STA dat_9872,Y       ;              dat_9871[Y] + $f0 (240)   (C = 1 on overflow else 0)
95c0: b9 77 98                  LDA dat_9877,Y       ;     Set dat_9878[Y]
95c3: 69 00                     ADC #$00             ;            =
95c5: 99 78 98                  STA dat_9878,Y       ;              dat_9877[Y] + C
95c8: c8                        INY                  ;     Add 1 to Y
95c9: c0 05                     CPY #$05             ; Repeat
95cb: 90 ea                     BCC loc_95b7         ;   while (Y < 5)
95cd: ad 4d 19                  LDA CurZoneFlags     ; If
95d0: 29 01                     AND #$01             ;    (((CurZoneFlags & 1) | ChrNumLights) == 0)
95d2: 0d 90 63                  ORA ChrNumLights     ;
95d5: d0 0a                     BNE loc_95e1         ; Then
95d7: a9 04                     LDA #$04             ;     Set
95d9: 8d 7f 98                  STA dat_987f         ;         dat_987f = 4
95dc: 8d 80 98                  STA dat_9880         ;     Set dat_9880 = 4
95df: d0 0d                     BNE loc_95ee         ; Else
95e1: a0 02     loc_95e1        LDY #$02             ;     Set Y = 2
95e3: b1 62                     LDA (dat_0062),Y     ;     Set
95e5: 8d 7f 98                  STA dat_987f         ;         dat_987f = (*dat_0062)[2]
95e8: c8                        INY                  ;     Add 1 to Y   (Y = 3)
95e9: b1 62                     LDA (dat_0062),Y     ;     Set
95eb: 8d 80 98                  STA dat_9880         ;         dat_9880 = (*dat_0062)[3]
                                                     ; End If
95ee: a9 04     loc_95ee        LDA #$04             ; Set
95f0: 85 62                     STA dat_0062         ;     dat_0062 = 4
95f2: a9 01                     LDA #$01             ; Set
95f4: 85 d3                     STA dat_00d3         ;     dat_00d3 = 1
95f6: a9 ff                     LDA #$ff             ; Set
95f8: 8d 70 98                  STA dat_9870         ;     dat_9870 = $ff
95fb: 8d 2f 02                  STA vblk_CRITIC      ; Set vblk_CRITIC = $ff
95fe: 20 30 18                  JSR j_sub_24c6       ; Call $1830 [j_sub_24c6]
9601: a9 03                     LDA #$03             ; Set
9603: 8d 0f d2                  STA SKCTL            ;     SKCTL = 3
9606: a9 00                     LDA #$00             ; Set
9608: 8d 08 d2                  STA AUDCTL           ;     AUDCTL = 0
960b: a2 83                     LDX #$83             ; Set X = $83
960d: ad 0c aa                  LDA FoeAlign         ; If (FoeAlign < 0)
9610: 10 06                     BPL loc_9618         ; Then
9612: e8                        INX                  ;     Add 1 to X   (X = $84)
9613: c9 81                     CMP #$81             ;     If (FoeAlign < $81)
9615: 90 01                     BCC loc_9618         ;     Then
9617: e8                        INX                  ;         Add 1 to X   (X = $85)
                                                     ;     End If
                                                     ; End If
9618: 8e 9c 19  loc_9618        STX SoundState       ; Set SoundState = X
961b: 60                        RTS                  ; Return to caller

                ;
                ;
                ;
961c: 20 30 18  sub_961c        JSR j_sub_24c6       ; Call $1830 [j_sub_24c6]
961f: a2 a6                     LDX #$a6             ; Set
9621: a0 b7                     LDY #$b7             ;     Y/X = $a6b7 [StrDiskPrompt]
9623: 20 ef 8e                  JSR dsplyTmpltStr    ; Call $8eef [dsplyTmpltStr] (in Y/X)
9626: 4c 3c 18                  JMP j_pressAnyKey    ; Continue @ $183c [j_pressAnyKey]

                ; Sets C = 1 and returns to caller
                ;
9629: 38        contRtsC1_9629  SEC                  ; Set C = 1
962a: 60                        RTS                  ; Return to caller

                ;
                ;
                ;
962b: ae 30 02  sub_962b        LDX DriveId          ; Set
962e: ca                        DEX                  ;     X
962f: 8a                        TXA                  ;       =
9630: 29 03                     AND #$03             ;         (DriveId - 1) & 3
9632: aa                        TAX                  ;
9633: bd 4e 02                  LDA DrivePresent,X   ; If (DrivePresent[X] < 0)
9636: 10 05                     BPL loc_963d         ; Then
9638: a9 31                     LDA #$31             ;     Set
963a: 8d 30 02                  STA DriveId          ;         DriveId = $31 ('1')
                                                     ; End If
963d: a9 00     loc_963d        LDA #$00             ; Set
963f: 8d 5b 02                  STA dat_025b         ;     dat_025b = 0
9642: a5 d7                     LDA dat_00d7         ; Set
9644: 06 d6                     ASL dat_00d6         ;     DiskSector_L
9646: 2a                        ROL                  ;        =                              (C = 1 on overflow else 0)
9647: 6d 32 02                  ADC DiskSector_L     ;          DiskSector_L + ((dat_00d7 << 1) | (dat_00d6 >>> 7))
964a: 8d 32 02                  STA DiskSector_L     ; Set dat_00d6 = dat_00d6 << 1
964d: 90 03                     BCC loc_9652         ; If (C == 1) Then
964f: ee 33 02                  INC DiskSector_H     ;     Add 1 to DiskSector_H
                                                     ; End If
9652: 46 d6     loc_9652        LSR dat_00d6         ; Set dat_00d6 = dat_00d6 >> 1          (bit 7 is now 0)
9654: a9 04     loc_9654        LDA #$04             ; Set
9656: 85 8b                     STA dat_008b         ;     dat_008b = 4                      (Up to 4 attempts)
9658: 20 00 18  loc_9658        JSR j_readNextSector ; Loop
                                                     ;     Call $9658 [j_readNextSector]
965b: 10 2c                     BPL loc_9689         ;     If (N == 0) Then
                                                     ;         Exit Loop                     (read successfully)
                                                     ;     End If
965d: 2c 3d 02                  BIT SioStatus        ;     If (SioStatus < 0)
9660: 30 c7                     BMI contRtsC1_9629   ;        Or
9662: 2c 58 02                  BIT SysMemorySize    ;        ((SysMemorySize & $40) == 0)
9665: 50 c2                     BVC contRtsC1_9629   ;     Then
                                                     ;         Set C = 1                    (via $9629 [contRtsC1_9629])
                                                     ;         Return to caller
                                                     ;     End If
9667: c6 8b     loc_9667        DEC dat_008b         ;     Loop
                                                     ;         Subtract 1 from dat_008b
9669: f0 be                     BEQ contRtsC1_9629   ;         If (dat_008b == 0)
                                                     ;             Set C = 1                (via $9629 [contRtsC1_9629])
                                                     ;             Return to caller
                                                     ;         End If
966b: a9 00                     LDA #$00             ;         Set
966d: 8d 5b 02                  STA dat_025b         ;             dat_025b = 0
9670: ee 30 02                  INC DriveId          ;         Add 1 to DriveId             (try next drive)
9673: ad 30 02                  LDA DriveId          ;         If
9676: c9 35                     CMP #$35             ;            (DriveId >= $35 ('5'))
9678: 90 05                     BCC loc_967f         ;         Then
967a: a9 31                     LDA #$31             ;             Set
967c: 8d 30 02                  STA DriveId          ;                 DriveId = $31 ('1')
                                                     ;         End If
967f: 29 0f     loc_967f        AND #$0f             ;         Set
9681: aa                        TAX                  ;             X = DriveId & $0f
9682: bd 4d 02                  LDA SioTimeout_H,X   ;     Repeat
9685: 10 d1                     BPL loc_9658         ;        while (SioTimeout_H[X] < 0)
9687: 30 de                     BMI loc_9667         ; Repeat while (true)
9689: a2 00     loc_9689        LDX #$00             ; Set X = 0
968b: bd 00 01  loc_968b        LDA SioBuf,X         ; Loop
                                                     ;     Set SioBuf[X]
968e: 4a                        LSR                  ;            =
968f: 7e 00 01                  ROR SioBuf,X         ;              (SioBuf[X] >> 1) | ((SioBuf[X] & 1) << 7)
9692: e8                        INX                  ;     Add 1 to X
9693: 10 f6                     BPL loc_968b         ; Repeat while (X >= 0)
9695: a6 d6                     LDX dat_00d6         ; Set X = dat_00d6
9697: a0 00                     LDY #$00             ; Set Y = 0
9699: a5 0c                     LDA NumBytes_H       ; If (NumBytes_H == 0)
969b: d0 09                     BNE loc_96a6         ;    And
969d: a5 0b                     LDA NumBytes_L       ;    (NumBytes_L >= 0)
969f: 30 05                     BMI loc_96a6         ; Then
96a1: 18                        CLC                  ;     If (NumBytes_L + dat_00d6 < 128)
96a2: 65 d6                     ADC dat_00d6         ;     Then
96a4: 10 2c                     BPL loc_96d2         ;         Continue @ $96d2 [loc_96d2]
                                                     ;     End If
                                                     ; End If
96a6: bd 00 01  loc_96a6        LDA SioBuf,X         ;
96a9: 91 09                     STA (DestAdr_L),Y    ;
96ab: c8                        INY                  ;
96ac: e8                        INX                  ;
96ad: 10 f7                     BPL loc_96a6         ;
96af: a9 00                     LDA #$00             ;
96b1: 85 d6                     STA dat_00d6         ;
96b3: 98                        TYA                  ;
96b4: 85 96                     STA dat_0096         ;
96b6: 18                        CLC                  ;
96b7: 65 09                     ADC DestAdr_L        ;
96b9: 85 09                     STA DestAdr_L        ;
96bb: 90 02                     BCC loc_96bf         ;
96bd: e6 0a                     INC DestAdr_H        ;
96bf: a5 0b     loc_96bf        LDA NumBytes_L       ;
96c1: 38                        SEC                  ;
96c2: e5 96                     SBC dat_0096         ;
96c4: 85 0b                     STA NumBytes_L       ;
96c6: a5 0c                     LDA NumBytes_H       ;
96c8: e9 00                     SBC #$00             ;
96ca: 85 0c                     STA NumBytes_H       ;
96cc: 05 0b                     ORA NumBytes_L       ;
96ce: d0 84                     BNE loc_9654         ;
96d0: f0 16                     BEQ loc_96e8         ;
96d2: bd 00 01  loc_96d2        LDA SioBuf,X         ;
96d5: 91 09                     STA (DestAdr_L),Y    ;
96d7: e8                        INX                  ;
96d8: c8                        INY                  ;
96d9: c4 0b                     CPY NumBytes_L       ;
96db: 90 f5                     BCC loc_96d2         ;
96dd: a5 0b                     LDA NumBytes_L       ;
96df: 18                        CLC                  ;
96e0: 65 09                     ADC DestAdr_L        ;
96e2: 85 09                     STA DestAdr_L        ;
96e4: 90 02                     BCC loc_96e8         ;
96e6: e6 0a                     INC DestAdr_H        ;
96e8: 18        loc_96e8        CLC                  ;
96e9: 60                        RTS                  ; Return to caller

                ;
                ; - Sums an array of uint16 values, excluding the final non-zero entry.
                ;
                ; Input
                ;   dat_0096      - Number of uint16 values to process (likely must be between 0 and 127?)
                ;   SourceAdr_L/H - Address of little-endian uint16 array
                ;
                ; Output
                ;   dat_00d6    - LSB of little-endian uint16 sum
                ;   dat_00d7    - MSB of little-endian uint16 sum
                ;
                ; Temp
                ;   dat_008b    - loop control var
                ;
96ea: a9 00     sub_96ea        LDA #$00             ; Set
96ec: 85 d6                     STA dat_00d6         ;     dat_00d6 = 0
96ee: 85 d7                     STA dat_00d7         ; Set dat_00d7 = 0
96f0: 85 8b                     STA dat_008b         ; Set dat_008b = 0  (max 256 iterations)
96f2: a5 8b     loc_96f2        LDA dat_008b         ; Loop
                                                     ;     If (dat_008b == dat_0096) Then
96f4: c5 96                     CMP dat_0096         ;        Exit Loop
96f6: f0 14                     BEQ loc_970c         ;     End If
96f8: 0a                        ASL                  ;     Set
96f9: a8                        TAY                  ;         Y = dat_008b << 1
96fa: 18                        CLC                  ;     Set
96fb: b1 07                     LDA (SourceAdr_L),Y  ;         dat_00d6
96fd: 65 d6                     ADC dat_00d6         ;            =
96ff: 85 d6                     STA dat_00d6         ;              dat_00d6 + (*SourceAdr_L)[Y]
9701: c8                        INY                  ;     Add 1 to Y
9702: b1 07                     LDA (SourceAdr_L),Y  ;     Set dat_00d7
9704: 65 d7                     ADC dat_00d7         ;            =
9706: 85 d7                     STA dat_00d7         ;              dat_00d7 + (*SourceAdr_L)[Y] + C
9708: e6 8b                     INC dat_008b         ;     Add 1 to dat_008b
970a: d0 e6                     BNE loc_96f2         ; Repeat while (dat_008b != 0)  (TODO: presumably, this condition is never expected as the value in A would be dat_00d7 and not dat_008b)
970c: 0a        loc_970c        ASL                  ; Set
970d: a8                        TAY                  ;     Y = dat_008b << 1
970e: b1 07     loc_970e        LDA (SourceAdr_L),Y  ; Loop
9710: 85 0b                     STA NumBytes_L       ;     Set NumBytes_L = (*SourceAdr_L)[Y]
9712: c8                        INY                  ;     Add 1 to Y
9713: b1 07                     LDA (SourceAdr_L),Y  ;     Set
9715: 85 0c                     STA NumBytes_H       ;         NumBytes_H = (*SourceAdr_L)[Y]
9717: 05 0b                     ORA NumBytes_L       ;     If ((NumBytes_L | NumBytes_H) != 0) Then
9719: d0 15                     BNE loc_9730         ;         Exit Loop
                                                     ;     End If
971b: 88                        DEY                  ;     Set Y
971c: 88                        DEY                  ;           =
971d: 88                        DEY                  ;             Y - 3
971e: 38                        SEC                  ;     Set
971f: a5 d6                     LDA dat_00d6         ;         dat_00d6
9721: f1 07                     SBC (SourceAdr_L),Y  ;            =
9723: 85 d6                     STA dat_00d6         ;              dat_00d6 - (*SourceAdr_L)[Y]
9725: c8                        INY                  ;     Add 1 to Y
9726: a5 d7                     LDA dat_00d7         ;     Set dat_00d7
9728: f1 07                     SBC (SourceAdr_L),Y  ;            =
972a: 85 d7                     STA dat_00d7         ;              dat_00d7 - (*SourceAdr_L)[Y] - ~C
972c: 88                        DEY                  ;     Subtract 1 from Y
972d: 4c 0e 97                  JMP loc_970e         ; Repeat while (true)
9730: 60        loc_9730        RTS                  ; Return to caller

                ;
                ;
                ;
9731: 20 67 90  sub_9731        JSR clrSmthngHere    ; Call $9067 [clrSmthngHere]

                ; ? Turns off player/missile display (e.g. hides the foe) ?
                ; ? Also seems as though it was intended to zero the memory where the foe player image data was stored,
                ;   but that code seems to be buggy. ?
                ;
                ;
                ;
9734: a9 00     sub_9734        LDA #$00             ; Set A = 0
9736: aa                        TAX                  ; Set X = 0   (1 iteration [0])    (Bug? It seems this should have
9737: 9d 00 bc  loc_9737        STA dat_bc00,X       ; Loop                               likely been `LDX #$ff` which
                                                     ;     Set dat_bc00[X] = 0            would have resulted in 256
973a: 9d 00 bd                  STA dat_bc00+256,X   ;     Set dat_bc00[256 + X] = 0      iterations and zeroed 1KB
973d: 9d 00 be                  STA dat_bc00+512,X   ;     Set dat_bc00[512 + X] = 0      starting at $bc00. Using BNE
9740: 9d 00 bf                  STA dat_bc00+768,X   ;     Set dat_bc00[768 + X] = 0      as used elsewhere instead of
9743: ca                        DEX                  ;     Subtract 1 from X              BPL would also have worked.)
9744: 10 f1                     BPL loc_9737         ; Repeat while (X >= 0)
9746: 8d 2f 02                  STA vblk_CRITIC      ; Set vblk_CRITIC = 0               (Enable VBLANK deferred vector)
9749: 8d 1d d0                  STA GRACTL           ; Set GRACTL = 0                    (Turn off players and missiles)
974c: a2 03                     LDX #$03             ; Set X = 4  (5 iterations [4..0])
974e: 9d 0d d0  loc_974e        STA GRAFP0,X         ; Loop
                                                     ;     Set GRAFP0[X] = 0             (Hide Player 0-3)
9751: 9d 00 d0                  STA HPOSP0,X         ;     Set HPOSP0[X] = 0             (Zero Player horiz pos 0-3)
9754: ca                        DEX                  ;     Subtract 1 from X
9755: 10 f7                     BPL loc_974e         ; Repeat while (X >= 0)
9757: 60                        RTS                  ; Return to caller

                ; Deferred VBLANK interrupt handler
                ;
                ; Input
                ;   dat_987f - Assigned to COLPM0/COLPM2
                ;   dat_9880 - Assigned to COLPM1/COLPM3
                ;   dat_987d - Assigned to HPOSP0/HPOSP1; Value plus 8 assigned to HPOSP2/HPOSP3
                ;   dat_00d3 - ? likely a vblank count to delay before switching the current animation frame
                ;   dat_00d2 -
                ;   dat_00ac -
                ;
9758: a9 3a     VVBLKD_9758     LDA #$3a             ; Set
975a: 8d 00 d4                  STA DMACTL           ;     DMACTL = $3a
975d: ad 7f 98                  LDA dat_987f         ; Set
9760: 8d 12 d0                  STA COLPM0           ;     COLPM0 = dat_987f
9763: 8d 14 d0                  STA COLPM2           ; Set COLPM2 = dat_987f
9766: ad 80 98                  LDA dat_9880         ; Set
9769: 8d 13 d0                  STA COLPM1           ;     COLPM1 = dat_9880
976c: 8d 15 d0                  STA COLPM3           ; Set COLPM3 = dat_9880
976f: 18                        CLC                  ;
9770: ad 7d 98                  LDA dat_987d         ; Set
9773: 8d 00 d0                  STA HPOSP0           ;     HPOSP0 = dat_987d
9776: 8d 01 d0                  STA HPOSP1           ; Set HPOSP1 = dat_987d
9779: 69 08                     ADC #$08             ; Set A = dat_987d + 8
977b: 8d 02 d0                  STA HPOSP2           ; Set HPOSP2 = A
977e: 8d 03 d0                  STA HPOSP3           ; Set HPOSP3 = A
9781: c6 d3                     DEC dat_00d3         ; Subtract 1 from dat_00d3
9783: f0 01                     BEQ loc_9786         ; If (dat_00d3 != 0) Then
9785: 60                        RTS                  ;     Return to caller
                                                     ; End If
9786: a5 d2     loc_9786        LDA dat_00d2         ; If (dat_00d2 != 0)
9788: d0 10                     BNE loc_979a         ;    And
978a: 24 ac                     BIT dat_00ac         ;    ((dat_00ac & $40) != 0)
978c: 50 0c                     BVC loc_979a         ; Then
978e: a0 01                     LDY #$01             ;     Set Y = 1
9790: a9 00                     LDA #$00             ;     Set
9792: 85 62                     STA dat_0062         ;         dat_0062 = 0
9794: b1 62                     LDA (dat_0062),Y     ;     Set
9796: 85 62                     STA dat_0062         ;         dat_0062 = (*dat_0062)[1]   (read $ac01 -> offset to??)
9798: c6 d2                     DEC dat_00d2         ;     Subtract 1 from dat_00d2
                                                     ; End If
979a: a0 00     loc_979a        LDY #$00             ; Loop
                                                     ;     Set Y = 0
979c: b1 62                     LDA (dat_0062),Y     ;     Set A = (*dat_0062)[0]
979e: 10 38                     BPL loc_97d8         ;     If (A < 0) Then
97a0: 29 7f                     AND #$7f             ;         Set A
97a2: 18                        CLC                  ;               =
97a3: 69 5c                     ADC #$5c             ;                 (A & $7f) + $5c (92)    (C=1 on overflow else 0)
97a5: 8d 7d 98                  STA dat_987d         ;         Set dat_987d = A
97a8: 8d 00 d0                  STA HPOSP0           ;         Set HPOSP0 = A
97ab: 8d 01 d0                  STA HPOSP1           ;         Set HPOSP1 = A
97ae: 69 08                     ADC #$08             ;         Set A = A + 8 + C         (Assume C should always be 0?)
97b0: 8d 02 d0                  STA HPOSP2           ;         Set HPOSP2 = A
97b3: 8d 03 d0                  STA HPOSP3           ;         Set HPOSP3 = A
97b6: c8                        INY                  ;         Add 1 to Y    (Y = 1)
97b7: b1 62                     LDA (dat_0062),Y     ;         Set
97b9: 8d 7e 98                  STA dat_987e         ;             dat_987e = (*dat_0062)[1]
97bc: 18                        CLC                  ;         Set
97bd: a5 62                     LDA dat_0062         ;             dat_0062
97bf: 69 02                     ADC #$02             ;                =
97c1: 85 62                     STA dat_0062         ;                  dat_0062 + 2
97c3: a9 00                     LDA #$00             ;         Set A = 0
97c5: a2 10                     LDX #$10             ;         Set X = $10 (17 iterations [16..0])
97c7: 9d 51 bc  loc_97c7        STA dat_bc00+81,X    ;         Loop
                                                     ;             dat_bc00[81 + X] = 0
97ca: 9d 51 bd                  STA dat_bc00+337,X   ;             dat_bc00[337 + X] = 0
97cd: 9d 51 be                  STA dat_bc00+593,X   ;             dat_bc00[593 + X] = 0
97d0: 9d 51 bf                  STA dat_bc00+849,X   ;             dat_bc00[849 + X] = 0
97d3: ca                        DEX                  ;             Subtract 1 from X
97d4: 10 f1                     BPL loc_97c7         ;         While (X >= 0)
97d6: 30 c2                     BMI loc_979a         ;         Continue Loop @ $979a [loc_979a]
                                                     ;     End If
97d8: c9 40     loc_97d8        CMP #$40             ;     If (A >= $40 (64))
97da: 90 07                     BCC loc_97e3         ;     Then
97dc: c8                        INY                  ;         Add 1 to Y   (Y = 1)
97dd: b1 62                     LDA (dat_0062),Y     ;         Set A = (*dat_0062)[1]
97df: 85 62                     STA dat_0062         ;         Set dat_0062 = A
97e1: d0 b7                     BNE loc_979a         ;         If (dat_0062 != 0) Then
                                                     ;             Continue Loop @ $979a [loc_979a]
                                                     ;         End if
                                                     ;     End if
                                                     ; Repeat while (false)
97e3: aa        loc_97e3        TAX                  ; Set X = A            (A should be in [0..63])
97e4: c8                        INY                  ; Add 1 to Y           (Y = 1 or 2 (perhaps 2 is not expected?))
97e5: b1 62                     LDA (dat_0062),Y     ; Set
97e7: 85 d3                     STA dat_00d3         ;     dat_00d3 = (*dat_0062)[Y]
97e9: bd 71 98                  LDA dat_9871,X       ; Set
97ec: 85 d6                     STA dat_00d6         ;     dat_00d6 = dat_9871[X]
97ee: bd 77 98                  LDA dat_9877,X       ; Set
97f1: 85 d7                     STA dat_00d7         ;     dat_00d7 = dat_9877[X]
97f3: 18                        CLC                  ; Set
97f4: ad 7e 98                  LDA dat_987e         ;     dat_00f4
97f7: 69 51                     ADC #$51             ;        =
97f9: 85 f4                     STA dat_00f4         ;          dat_987e + $51
97fb: a9 bc                     LDA #$bc             ; Set
97fd: 85 f5                     STA dat_00f5         ;     dat_00f5 = $bc   (?? dat_00f4/dat_00f5 = $bc51 + dat_987e ??)
97ff: a2 04                     LDX #$04             ; Set X = 4
9801: a0 3b     loc_9801        LDY #$3b             ; Loop
                                                     ;     Set Y = $3b (59)
9803: b1 d6     loc_9803        LDA (dat_00d6),Y     ;     Loop
9805: 91 f4                     STA (dat_00f4),Y     ;         (*dat_00f4)[Y] = (*dat_00d6)[Y]
9807: 88                        DEY                  ;         Subtract 1 from Y
9808: 10 f9                     BPL loc_9803         ;     Repeat while (Y >= 0)
980a: a5 d6                     LDA dat_00d6         ;     Set
980c: 18                        CLC                  ;         dat_00d6
980d: 69 3c                     ADC #$3c             ;            =
980f: 85 d6                     STA dat_00d6         ;              dat_00d6 + $3c (60)
9811: 90 02                     BCC loc_9815         ;     If (C == 1) Then
9813: e6 d7                     INC dat_00d7         ;         Add 1 to dat_00d7
                                                     ;     End If
9815: e6 f5     loc_9815        INC dat_00f5         ;     Add 1 to dat_00f5
9817: ca                        DEX                  ;     Subtract 1 from X
9818: d0 e7                     BNE loc_9801         ; Repeat while (X != 0)
981a: a5 62                     LDA dat_0062         ; Set
981c: 18                        CLC                  ;     dat_0062
981d: 69 02                     ADC #$02             ;        =
981f: 85 62                     STA dat_0062         ;          dat_0062 + 2
9821: 90 02                     BCC loc_9825         ; If (C == 1) Then
9823: e6 63                     INC dat_0063         ;     Add 1 to dat_0063
                                                     ; End If
9825: 60        loc_9825        RTS                  ; Return to caller

                ;
                ;
                ;
9826: 60        sub_9826        RTS                  ; Return to caller

                ; Clears the compass and arrows from the gfx character sets
                ;
9827: a2 08     clrCmpssArrws   LDX #$08             ; Set X = 8 (9 iterations [8..0] - number of lines to clear)
9829: a0 37     loc_9829        LDY #$37             ; Loop
                                                     ;     Set Y = $37 (56 iterations [55..0] - clear 10 chars)
982b: bd 4c 98                  LDA tbl_984c_L,X     ;     Set
982e: 85 07                     STA SourceAdr_L      ;         SourceAdr_L/H
9830: bd 55 98                  LDA tbl_984c_H,X     ;         to
9833: 85 08                     STA SourceAdr_H      ;         tbl_984c_L/H[X]
9835: bd 5e 98                  LDA tbl_985e_L,X     ;     Set
9838: 85 09                     STA DestAdr_L        ;         DestAdr_L/H
983a: bd 67 98                  LDA tbl_985e_H,X     ;         to
983d: 85 0a                     STA DestAdr_H        ;         tbl_985e_L/H[X]
983f: a9 ff                     LDA #$ff             ;     Set A = $ff
9841: 91 07     loc_9841        STA (SourceAdr_L),Y  ;     Loop
                                                     ;         Set (*SourceAdr_L)[Y] = $ff      (clear compass)
9843: 91 09                     STA (DestAdr_L),Y    ;         Set (*DestAdr_L)[Y] = $ff        (clear arrows)
9845: 88                        DEY                  ;         Subtract 1 from Y
9846: 10 f9                     BPL loc_9841         ;     Repeat while (Y >= 0)
9848: ca                        DEX                  ;     Subtract 1 from X
9849: 10 de                     BPL loc_9829         ; Repeat while (X >= 0)
984b: 60                        RTS                  ; Return to caller

984c: 18 58 98  tbl_984c_L      .BYTE $18,$58,$98              ; 9 bytes: (clrCmpssArrws) Left-hand side charset
984f: 18 58 98 18 58 98         .BYTE $18,$58,$98,$18,$58,$98  ;          destination LSBs

9855: 08 09 0a  tbl_984c_H      .BYTE $08,$09,$0a              ; 9 bytes: (clrCmpssArrws) Left-hand side charset
9858: 0c 0d 0e 10 11 12         .BYTE $0c,$0d,$0e,$10,$11,$12  ;          destination MSBs
                                                               ;     0: $0818 [GfxTopCharset+24]
                                                               ;     1: $0958 [GfxTopCharset+344]
                                                               ;     2: $0a98 [GfxTopCharset+664]
                                                               ;     3: $0c18 [GfxMidCharset+24]
                                                               ;     4: $0d58 [GfxMidCharset+344]
                                                               ;     5: $0e98 [GfxMidCharset+664]
                                                               ;     6: $1018 [GfxBtmCharset+24]
                                                               ;     7: $1158 [GfxBtmCharset+344]
                                                               ;     8: $1298 [GfxBtmCharset+664]

985e: f8 38 78  tbl_985e_L      .BYTE $f8,$38,$78              ; 9 bytes: (clrCmpssArrws) Right-hand side charset
9861: f8 38 78 f8 38 78         .BYTE $f8,$38,$78,$f8,$38,$78  ;          destination LSBs

9867: 08 0a 0b  tbl_985e_H      .BYTE $08,$0a,$0b              ; 9 bytes: (clrCmpssArrws) Right-hand side charset
986a: 0c 0e 0f 10 12 13         .BYTE $0c,$0e,$0f,$10,$12,$13  ;          destination MSBs
                                                               ;     0: $08f8 [GfxTopCharset+248]
                                                               ;     1: $0a38 [GfxTopCharset+568]
                                                               ;     2: $0b78 [GfxTopCharset+888]
                                                               ;     3: $0cf8 [GfxMidCharset+248]
                                                               ;     4: $0e38 [GfxMidCharset+568]
                                                               ;     5: $0f78 [GfxMidCharset+888]
                                                               ;     6: $10f8 [GfxBtmCharset+248]
                                                               ;     7: $1238 [GfxBtmCharset+568]
                                                               ;     8: $1378 [GfxBtmCharset+888]

9870: 00        dat_9870        .BYTE $00            ; .
9871: 00        dat_9871        .BYTE $00            ; .
9872: 00        dat_9872        .BYTE $00            ; .
9873: 00                        BRK                  ; .
9874: 00                        BRK                  ; .
9875: 00                        BRK                  ; .
9876: 00                        BRK                  ; .
9877: 00        dat_9877        .BYTE $00            ; .
9878: 00        dat_9878        .BYTE $00            ; .
9879: 00                        BRK                  ; .
987a: 00                        BRK                  ; .
987b: 00                        BRK                  ; .
987c: 00                        BRK                  ; .
987d: 78        dat_987d        .BYTE $78            ; x
987e: 0b        dat_987e        .BYTE $0b            ; .
987f: 00        dat_987f        .BYTE $00            ; .
9880: 00        dat_9880        .BYTE $00            ; .

9881: a8        StrClearRows    .BYTE $a8                              ; {Clear all message rows}
9882: ff                        .BYTE $ff                              ; {End of string}

9883: a6 00 01  StrSurprised    .BYTE $a6,$00,$01                      ; {Col 0 Row 1}
9886: a5                        .BYTE $a5                              ; {Center}
9887: 53 55 52 50 52 49 53 45   .BYTE $53,$55,$52,$50,$52,$49,$53,$45  ; "SURPRISE"
988f: 44 0d                     .BYTE $44,$0d                          ; "D\r"
9891: 0d        StrNoOptions    .BYTE $0d                              ; "\r"
9892: a5                        .BYTE $a5                              ; {Center}
9893: 4e 6f 20 6f 70 74 69 6f   .BYTE $4e,$6f,$20,$6f,$70,$74,$69,$6f  ; "No optio"
989b: 6e 73 2e 0d               .BYTE $6e,$73,$2e,$0d                  ; "ns.\r"
989f: ff                        .BYTE $ff                              ; {End of string}

98a0: 66 6f 6f  ZtsFood         .BYTE $66,$6f,$6f                      ; "foo"
98a3: 64 00                     .BYTE $64,$00                          ; "d\0"

98a5: 77 61 74  ZtsWater        .BYTE $77,$61,$74                      ; "wat"
98a8: 65 72 00                  .BYTE $65,$72,$00                      ; "er\0"

98ab: 74 6f 72  ZtsTorches      .BYTE $74,$6f,$72                      ; "tor"
98ae: 63 68 65 73 00            .BYTE $63,$68,$65,$73,$00              ; "ches\0"

98b3: 74 69 6d  ZtsTimepieces   .BYTE $74,$69,$6d                      ; "tim"
98b6: 65 70 69 65 63 65 73 00   .BYTE $65,$70,$69,$65,$63,$65,$73,$00  ; "epieces\0"

98be: 63 6f 6d  ZtsCompasses    .BYTE $63,$6f,$6d                      ; "com"
98c1: 70 61 73 73 65 73 00      .BYTE $70,$61,$73,$73,$65,$73,$00      ; "passes\0"

98c8: 6b 65 79  ZtsKeys         .BYTE $6b,$65,$79                      ; "key"
98cb: 73 00                     .BYTE $73,$00                          ; "s\0"

98cd: 63 72 79  ZtsCrystals     .BYTE $63,$72,$79                      ; "cry"
98d0: 73 74 61 6c 73 00         .BYTE $73,$74,$61,$6c,$73,$00          ; "stals\0"

98d6: 67 65 6d  ZtsGems         .BYTE $67,$65,$6d                      ; "gem"
98d9: 73 00                     .BYTE $73,$00                          ; "s\0"

98db: 6a 65 77  ZtsJewels       .BYTE $6a,$65,$77                      ; "jew"
98de: 65 6c 73 00               .BYTE $65,$6c,$73,$00                  ; "els\0"

98e2: 67 6f 6c  ZtsGold         .BYTE $67,$6f,$6c                      ; "gol"
98e5: 64 00                     .BYTE $64,$00                          ; "d\0"

98e7: 73 69 6c  ZtsSilver       .BYTE $73,$69,$6c                      ; "sil"
98ea: 76 65 72 00               .BYTE $76,$65,$72,$00                  ; "ver\0"

98ee: 63 6f 70  ZtsCopper       .BYTE $63,$6f,$70                      ; "cop"
98f1: 70 65 72 00               .BYTE $70,$65,$72,$00                  ; "per\0"

98f5: a0 a5 ab  PrvsnNames_L    .BYTE $a0,$a5,$ab                      ; 12 bytes: LSB of provision name Zts address
98f8: b3 be c8 cd d6 db e2 e7   .BYTE $b3,$be,$c8,$cd,$d6,$db,$e2,$e7  ;
9900: ee                        .BYTE $ee                              ;

9901: 98 98 98  PrvsnNames_H    .BYTE $98,$98,$98                      ; 12 bytes: LSB of provision name Zts address
9904: 98 98 98 98 98 98 98 98   .BYTE $98,$98,$98,$98,$98,$98,$98,$98  ;     0: $98a0 [ZtsFood]
990c: 98                        .BYTE $98                              ;     1: $98a5 [ZtsWater]
                                                                       ;     2: $98ab [ZtsTorches]
                                                                       ;     3: $98b3 [ZtsTimepieces]
                                                                       ;     4: $98be [ZtsCompasses]
                                                                       ;     5: $98c8 [ZtsKeys]
                                                                       ;     6: $98cd [ZtsCrystals]
                                                                       ;     7: $98d6 [ZtsGems]
                                                                       ;     8: $98db [ZtsJewels]
                                                                       ;     9: $98e2 [ZtsGold]
                                                                       ;    10: $98e7 [ZtsSilver]
                                                                       ;    11: $98ee [ZtsCopper]

990d: ac 65 76  StrIsStunned    .BYTE $ac,$65,$76                      ; {Continue @ $7665 [sub_7665]}
9910: 69 73 20 73 74 75 6e 6e   .BYTE $69,$73,$20,$73,$74,$75,$6e,$6e  ; "is stunn"
9918: 65 64 2e 0d               .BYTE $65,$64,$2e,$0d                  ; "ed.\r"
991c: ff                        .BYTE $ff                              ; {End of string}

991d: 54 68 65  ZtsLightWizrds  .BYTE $54,$68,$65                      ; "The"
9920: 20 4c 69 67 68 74 20 57   .BYTE $20,$4c,$69,$67,$68,$74,$20,$57  ; " Light W"
9928: 69 7a 61 72 64 73 00      .BYTE $69,$7a,$61,$72,$64,$73,$00      ; "izards\0"

992f: 54 68 65  ZtsDarkWizards  .BYTE $54,$68,$65                      ; "The"
9932: 20 44 61 72 6b 20 57 69   .BYTE $20,$44,$61,$72,$6b,$20,$57,$69  ; " Dark Wi"
993a: 7a 61 72 64 73 00         .BYTE $7a,$61,$72,$64,$73,$00          ; "zards\0"

9940: 54 68 65  ZtsGldOfOrder   .BYTE $54,$68,$65                      ; "The"
9943: 20 47 75 69 6c 64 20 6f   .BYTE $20,$47,$75,$69,$6c,$64,$20,$6f  ; " Guild o"
994b: 66 20 4f 72 64 65 72 00   .BYTE $66,$20,$4f,$72,$64,$65,$72,$00  ; "f Order\0"

9953: 54 68 65  ZtsGldOfChaos   .BYTE $54,$68,$65                      ; "The"
9956: 20 47 75 69 6c 64 20 6f   .BYTE $20,$47,$75,$69,$6c,$64,$20,$6f  ; " Guild o"
995e: 66 20 43 68 61 6f 73 00   .BYTE $66,$20,$43,$68,$61,$6f,$73,$00  ; f Chaos\0"

9966: 54 68 65  ZtsGldOfLaw     .BYTE $54,$68,$65                      ; "The"
9969: 20 47 75 69 6c 64 20 6f   .BYTE $20,$47,$75,$69,$6c,$64,$20,$6f  ; " Guild o"
9971: 66 20 4c 61 77 00         .BYTE $66,$20,$4c,$61,$77,$00          ; "f Law\0"

9977: 54 68 65  ZtsThievesGld   .BYTE $54,$68,$65                      ; "The"
997a: 20 54 68 69 65 76 65 73   .BYTE $20,$54,$68,$69,$65,$76,$65,$73  ; " Thieves"
9982: 20 47 75 69 6c 64 00      .BYTE $20,$47,$75,$69,$6c,$64,$00      ; " Guild\0"

9989: 54 68 65  ZtsGreenWizrds  .BYTE $54,$68,$65                      ; "The"
998c: 20 47 72 65 65 6e 20 57   .BYTE $20,$47,$72,$65,$65,$6e,$20,$57  ; " Green W"
9994: 69 7a 61 72 64 73 00      .BYTE $69,$7a,$61,$72,$64,$73,$00      ; "izards\0"

999b: 54 68 65  ZtsRedWizards   .BYTE $54,$68,$65                      ; "The"
999e: 20 52 65 64 20 57 69 7a   .BYTE $20,$52,$65,$64,$20,$57,$69,$7a  ; " Red Wiz"
99a6: 61 72 64 73 00            .BYTE $61,$72,$64,$73,$00              ; "ards\0"

99ab: 54 68 65  ZtsStarWizards  .BYTE $54,$68,$65                      ; "The"
99ae: 20 53 74 61 72 20 57 69   .BYTE $20,$53,$74,$61,$72,$20,$57,$69  ; " Star Wi"
99b6: 7a 61 72 64 73 00         .BYTE $7a,$61,$72,$64,$73,$00          ; "zards\0"

99bc: 54 68 65  ZtsBlueWizards  .BYTE $54,$68,$65                      ; "The"
99bf: 20 42 6c 75 65 20 57 69   .BYTE $20,$42,$6c,$75,$65,$20,$57,$69  ; " Blue Wi"
99c7: 7a 61 72 64 73 00         .BYTE $7a,$61,$72,$64,$73,$00          ; "zards\0"

99cd: 54 68 65  ZtsPhysicnsGld  .BYTE $54,$68,$65                      ; "The"
99d0: 20 50 68 79 73 69 63 69   .BYTE $20,$50,$68,$79,$73,$69,$63,$69  ; " Physici"
99d8: 61 6e 73 20 47 75 69 6c   .BYTE $61,$6e,$73,$20,$47,$75,$69,$6c  ; "ans Guil"
99e0: 64 00                     .BYTE $64,$00                          ; "d\0"

99e2: 54 68 65  ZtsAssassnsGld  .BYTE $54,$68,$65                      ; "The"
99e5: 20 41 73 73 61 73 73 69   .BYTE $20,$41,$73,$73,$61,$73,$73,$69  ; " Assassi"
99ed: 6e 73 20 47 75 69 6c 64   .BYTE $6e,$73,$20,$47,$75,$69,$6c,$64  ; "ns Guild"
99f5: 00                        .BYTE $00                              ; "\0"

99f6: 54 68 65  ZtsPaladins     .BYTE $54,$68,$65                      ; "The"
99f9: 20 50 61 6c 61 64 69 6e   .BYTE $20,$50,$61,$6c,$61,$64,$69,$6e  ; " Paladin"
9a01: 73 00                     .BYTE $73,$00                          ; "s\0"

9a03: 54 68 65  ZtsMercenryGld  .BYTE $54,$68,$65                      ; "The"
9a06: 20 4d 65 72 63 65 6e 61   .BYTE $20,$4d,$65,$72,$63,$65,$6e,$61  ; " Mercena"
9a0e: 72 79 20 47 75 69 6c 64   .BYTE $72,$79,$20,$47,$75,$69,$6c,$64  ; "ry Guild"
9a16: 00                        .BYTE $00                              ; "\0"

9a17: 61 20 66  ZtsAFriend      .BYTE $61,$20,$66                      ; "a f"
9a1a: 72 69 65 6e 64 00         .BYTE $72,$69,$65,$6e,$64,$00          ; "riend\0"

9a20: 54 68 65  ZtsThePalace    .BYTE $54,$68,$65                      ; "The"
9a23: 20 50 61 6c 61 63 65 00   .BYTE $20,$50,$61,$6c,$61,$63,$65,$00  ; " Palace\0"

9a2b: 1d 2f 40  FactionNames_L  .BYTE $1d,$2f,$40                      ; 16 bytes: LSB of Zts address
9a2e: 53 66 77 89 9b ab bc cd   .BYTE $53,$66,$77,$89,$9b,$ab,$bc,$cd  ;
9a36: e2 f6 03 17 20            .BYTE $e2,$f6,$03,$17,$20              ;

9a3b: 99 99 99  FactionNames_H  .BYTE $99,$99,$99                      ; 16 bytes: MSB of Zts address
9a3e: 99 99 99 99 99 99 99 99   .BYTE $99,$99,$99,$99,$99,$99,$99,$99  ;     0: $991d [ZtsLightWizrds]
9a46: 99 99 9a 9a 9a            .BYTE $99,$99,$9a,$9a,$9a              ;     1: $992f [ZtsDarkWizards]
                                                                       ;     2: $9940 [ZtsGldOfOrder]
                                                                       ;     3: $9953 [ZtsGldOfChaos]
                                                                       ;     4: $9966 [ZtsGldOfLaw]
                                                                       ;     5: $9977 [ZtsThievesGld]
                                                                       ;     6: $9989 [ZtsGreenWizrds]
                                                                       ;     7: $999b [ZtsRedWizards]
                                                                       ;     8: $99ab [ZtsStarWizards]
                                                                       ;     9: $99bc [ZtsBlueWizards]
                                                                       ;    10: $99cd [ZtsPhysicnsGld]
                                                                       ;    11: $99e2 [ZtsAssassnsGld]
                                                                       ;    12: $99f6 [ZtsPaladins]
                                                                       ;    13: $9a03 [ZtsMercenryGld]
                                                                       ;    14: $9a17 [ZtsAFriend]
                                                                       ;    15: $9a20 [ZtsThePalace]

9a4b: a6 00 00  StrBattleOptns  .BYTE $a6,$00,$00                      ; {Col 0 Row 0}
9a4e: a5                        .BYTE $a5                              ; {Center}
9a4f: 42 61 74 74 6c 65 20 4f   .BYTE $42,$61,$74,$74,$6c,$65,$20,$4f  ; "Battle O"
9a57: 70 74 69 6f 6e 73 0d      .BYTE $70,$74,$69,$6f,$6e,$73,$0d      ; "ptions\r"
9a5e: a6 0a 02                  .BYTE $a6,$0a,$02                      ; {Col 10 Row 2}
9a61: 28                        .BYTE $28                              ; "("
9a62: a1                        .BYTE $a1                              ; {Blink On}
9a63: 31                        .BYTE $31                              ; "1"
9a64: a0                        .BYTE $a0                              ; {Blink Off}
9a65: 29 20 41 74 74 61 63 6b   .BYTE $29,$20,$41,$74,$74,$61,$63,$6b  ; ") Attack"
9a6d: a6 0a 03                  .BYTE $a6,$0a,$03                      ; {Col 10 Row 3}
9a70: 28                        .BYTE $28                              ; "("
9a71: a1                        .BYTE $a1                              ; {Blink On}
9a72: 32                        .BYTE $32                              ; "2"
9a73: a0                        .BYTE $a0                              ; {Blink Off}
9a74: 29 20 43 68 61 72 67 65   .BYTE $29,$20,$43,$68,$61,$72,$67,$65  ; ") Charge"
9a7c: a6 0a 04                  .BYTE $a6,$0a,$04                      ; {Col 10 Row 4}
9a7f: 28                        .BYTE $28                              ; "("
9a80: a1                        .BYTE $a1                              ; {Blink On}
9a81: 33                        .BYTE $33                              ; "3"
9a82: a0                        .BYTE $a0                              ; {Blink Off}
9a83: 29 20 41 69 6d 65 64 20   .BYTE $29,$20,$41,$69,$6d,$65,$64,$20  ; ") Aimed "
9a8b: 41 74 74 61 63 6b         .BYTE $41,$74,$74,$61,$63,$6b          ; "Attack"
9a91: a6 0a 05                  .BYTE $a6,$0a,$05                      ; {Col 10 Row 5}
9a94: 28                        .BYTE $28                              ; "("
9a95: a1                        .BYTE $a1                              ; {Blink On}
9a96: 34                        .BYTE $34                              ; "4"
9a97: a0                        .BYTE $a0                              ; {Blink Off}
9a98: 29 20 54 72 61 6e 73 61   .BYTE $29,$20,$54,$72,$61,$6e,$73,$61  ; ") Transa"
9aa0: 63 74                     .BYTE $63,$74                          ; "ct"
9aa2: a6 0a 06                  .BYTE $a6,$0a,$06                      ; {Col 10 Row 6}
9aa5: 28                        .BYTE $28                              ; "("
9aa6: a1                        .BYTE $a1                              ; {Blink On}
9aa7: 35                        .BYTE $35                              ; "5"
9aa8: a0                        .BYTE $a0                              ; {Blink Off}
9aa9: 29 20 53 77 69 74 63 68   .BYTE $29,$20,$53,$77,$69,$74,$63,$68  ; ") Switch"
9ab1: 20 77 65 61 70 6f 6e      .BYTE $20,$77,$65,$61,$70,$6f,$6e      ; " weapon"
9ab8: a6 0a 07                  .BYTE $a6,$0a,$07                      ; {Col 10 Row 7}
9abb: 28                        .BYTE $28                              ; "("
9abc: a1                        .BYTE $a1                              ; {Blink On}
9abd: 30                        .BYTE $30                              ; "0"
9abe: a0                        .BYTE $a0                              ; {Blink Off}
9abf: 29 20 54 75 72 6e 20 61   .BYTE $29,$20,$54,$75,$72,$6e,$20,$61  ; ") Turn a"
9ac7: 6e 64 20 72 75 6e 21      .BYTE $6e,$64,$20,$72,$75,$6e,$21      ; "nd run!"
9ace: ff                        .BYTE $ff                              ; {End of string}

9acf: a6 00 00  StrTrnsctOptns  .BYTE $a6,$00,$00                      ; {Col 0 Row 0}
9ad2: a5                        .BYTE $a5                              ; {Center}
9ad3: 54 72 61 6e 73 61 63 74   .BYTE $54,$72,$61,$6e,$73,$61,$63,$74  ; "Transact"
9adb: 20 4f 70 74 69 6f 6e 73   .BYTE $20,$4f,$70,$74,$69,$6f,$6e,$73  ; " Options"
9ae3: 0d                        .BYTE $0d                              ; "\r"
9ae4: a6 0f 02                  .BYTE $a6,$0f,$02                      ; {Col 15 Row 2}
9ae7: 28                        .BYTE $28                              ; "("
9ae8: a1                        .BYTE $a1                              ; {Blink On}
9ae9: 31                        .BYTE $31                              ; "1"
9aea: a0                        .BYTE $a0                              ; {Blink Off}
9aeb: 29 20 4f 66 66 65 72      .BYTE $29,$20,$4f,$66,$66,$65,$72      ; ") Offer"
9af2: a6 0f 03                  .BYTE $a6,$0f,$03                      ; {Col 15 Row 3}
9af5: 28                        .BYTE $28                              ; "("
9af6: a1                        .BYTE $a1                              ; {Blink On}
9af7: 32                        .BYTE $32                              ; "2"
9af8: a0                        .BYTE $a0                              ; {Blink Off}
9af9: 29 20 42 6c 75 66 66      .BYTE $29,$20,$42,$6c,$75,$66,$66      ; ") Bluff"
9b00: a6 0f 04                  .BYTE $a6,$0f,$04                      ; {Col 15 Row 4}
9b03: 28                        .BYTE $28                              ; "("
9b04: a1                        .BYTE $a1                              ; {Blink On}
9b05: 33                        .BYTE $33                              ; "3"
9b06: a0                        .BYTE $a0                              ; {Blink Off}
9b07: 29 20 54 72 69 63 6b      .BYTE $29,$20,$54,$72,$69,$63,$6b      ; ") Trick"
9b0e: a6 0f 05                  .BYTE $a6,$0f,$05                      ; {Col 15 Row 5}
9b11: 28                        .BYTE $28                              ; "("
9b12: a1                        .BYTE $a1                              ; {Blink On}
9b13: 34                        .BYTE $34                              ; "4"
9b14: a0                        .BYTE $a0                              ; {Blink Off}
9b15: 29 20 48 61 69 6c         .BYTE $29,$20,$48,$61,$69,$6c          ; ") Hail"
9b1b: a6 0f 06                  .BYTE $a6,$0f,$06                      ; {Col 15 Row 6}
9b1e: 28                        .BYTE $28                              ; "("
9b1f: a1                        .BYTE $a1                              ; {Blink On}
9b20: 30                        .BYTE $30                              ; "0"
9b21: a0                        .BYTE $a0                              ; {Blink Off}
9b22: 29 20 4c 65 61 76 65      .BYTE $29,$20,$4c,$65,$61,$76,$65      ; ") Leave"
9b29: ff                        .BYTE $ff                              ; {End of string}

9b2a: a6 00 00  StrYouSurprise  .BYTE $a6,$00,$00                      ; {Col 0 Row 0}
9b2d: a5                        .BYTE $a5                              ; {Center}
9b2e: 59 6f 75 20 73 75 72 70   .BYTE $59,$6f,$75,$20,$73,$75,$72,$70  ; "You surp"
9b36: 72 69 73 65 20 74 68 65   .BYTE $72,$69,$73,$65,$20,$74,$68,$65  ; "rise the"
9b3e: 20                        .BYTE $20                              ; " "
9b3f: b4 01 aa 14               .BYTE $b4,$01,$aa,$14                  ; {Print zts @ addr in $aa01 [FoeNameZts_L] wid 20}
9b43: 2e 0d                     .BYTE $2e,$0d                          ; ".\r"
9b45: a5                        .BYTE $a5                              ; {Center}
9b46: 41 74 74 65 6d 70 74 20   .BYTE $41,$74,$74,$65,$6d,$70,$74,$20  ; "Attempt "
9b4e: 74 6f 3a 0d               .BYTE $74,$6f,$3a,$0d                  ; "to:\r"
9b52: a6 0a 03                  .BYTE $a6,$0a,$03                      ; {Col 10 Row 3}
9b55: 28                        .BYTE $28                              ; "("
9b56: a1                        .BYTE $a1                              ; {Blink On}
9b57: 31                        .BYTE $31                              ; "1"
9b58: a0                        .BYTE $a0                              ; {Blink Off}
9b59: 29 20 77 61 79 6c 61 79   .BYTE $29,$20,$77,$61,$79,$6c,$61,$79  ; ") waylay"
9b61: 20 74 68 65 20            .BYTE $20,$74,$68,$65,$20              ; " the "
9b66: b4 01 aa 14               .BYTE $b4,$01,$aa,$14                  ; {Print zts @ addr in $aa01 [FoeNameZts_L] wid 20}
9b6a: 2e                        .BYTE $2e                              ; "."
9b6b: a6 0a 04                  .BYTE $a6,$0a,$04                      ; {Col 10 Row 4}
9b6e: 28                        .BYTE $28                              ; "("
9b6f: a1                        .BYTE $a1                              ; {Blink On}
9b70: 32                        .BYTE $32                              ; "2"
9b71: a0                        .BYTE $a0                              ; {Blink Off}
9b72: 29 20 73 6e 61 74 63 68   .BYTE $29,$20,$73,$6e,$61,$74,$63,$68  ; ") snatch"
9b7a: 20 73 6f 6d 65 74 68 69   .BYTE $20,$73,$6f,$6d,$65,$74,$68,$69  ; " somethi"
9b82: 6e 67 2e                  .BYTE $6e,$67,$2e                      ; "ng."
9b85: a6 0a 05                  .BYTE $a6,$0a,$05                      ; {Col 10 Row 5}
9b88: 28                        .BYTE $28                              ; "("
9b89: a1                        .BYTE $a1                              ; {Blink On}
9b8a: 33                        .BYTE $33                              ; "3"
9b8b: a0                        .BYTE $a0                              ; {Blink Off}
9b8c: 29 20 6e 6f 6e 65 20 6f   .BYTE $29,$20,$6e,$6f,$6e,$65,$20,$6f  ; ") none o"
9b94: 66 20 74 68 65 73 65 2e   .BYTE $66,$20,$74,$68,$65,$73,$65,$2e  ; "f these."
9b9c: a6 0a 07                  .BYTE $a6,$0a,$07                      ; {Col 10 Row 7}
9b9f: 28                        .BYTE $28                              ; "("
9ba0: a1                        .BYTE $a1                              ; {Blink On}
9ba1: 30                        .BYTE $30                              ; "0"
9ba2: a0                        .BYTE $a0                              ; {Blink Off}
9ba3: 29 20 4c 65 61 76 65 2e   .BYTE $29,$20,$4c,$65,$61,$76,$65,$2e  ; ") Leave."
9bab: ff                        .BYTE $ff                              ; {End of string}

9bac: 59 6f 75  ZtsYouGrab      .BYTE $59,$6f,$75                      ; "You"
9baf: 20 67 72 61 62 20 00      .BYTE $20,$67,$72,$61,$62,$20,$00      ; " grab \0"

9bb6: a6 00 02  StrNthngOfValu  .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
9bb9: a5                        .BYTE $a5                              ; {Center}
9bba: b3 ac 9b 0a               .BYTE $b3,$ac,$9b,$0a                  ; {Print zts @ $9bac [ZtsYouGrab] wid 10}
9bbe: 6e 6f 74 68 69 6e 67 20   .BYTE $6e,$6f,$74,$68,$69,$6e,$67,$20  ; "nothing "
9bc6: 6f 66 20 76 61 6c 75 65   .BYTE $6f,$66,$20,$76,$61,$6c,$75,$65  ; "of value"
9bce: 2e 0d                     .BYTE $2e,$0d                          ; ".\r"
9bd0: ff                        .BYTE $ff                              ; {End of string}

9bd1: a6 00 02  StrSomeOfThe    .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
9bd4: a5                        .BYTE $a5                              ; {Center}
9bd5: b3 ac 9b 0a               .BYTE $b3,$ac,$9b,$0a                  ; {Print zts @ $9bac [ZtsYouGrab] wid 10}
9bd9: 73 6f 6d 65 20 6f 66 20   .BYTE $73,$6f,$6d,$65,$20,$6f,$66,$20  ; "some of "
9be1: 74 68 65 0d               .BYTE $74,$68,$65,$0d                  ; "the\r"
9be5: a5                        .BYTE $a5                              ; {Center}
9be6: b4 01 aa 14               .BYTE $b4,$01,$aa,$14                  ; {Print zts @ addr in $aa01 [FoeNameZts_L] wid 20}
9bea: 27 73 20                  .BYTE $27,$73,$20                      ; "'s "
9bed: b4 d9 76 14               .BYTE $b4,$d9,$76,$14                  ; {Print zts @ addr in $76d9 [GrbItemName_L] wid 20}
9bf1: 2e 0d                     .BYTE $2e,$0d                          ; ".\r"
9bf3: ff                        .BYTE $ff                              ; {End of string}

9bf4: a6 00 03  StrTrickFailed  .BYTE $a6,$00,$03                      ; {Col 0 Row 3}
9bf7: a5                        .BYTE $a5                              ; {Center}
9bf8: 59 6f 75 72 20 74 72 69   .BYTE $59,$6f,$75,$72,$20,$74,$72,$69  ; "Your tri"
9c00: 63 6b 20 66 61 69 6c 65   .BYTE $63,$6b,$20,$66,$61,$69,$6c,$65  ; "ck faile"
9c08: 64 2e 0d                  .BYTE $64,$2e,$0d                      ; "d.\r"
9c0b: ff                        .BYTE $ff                              ; {End of string}

9c0c: ac 65 76  StrNotGngForIt  .BYTE $ac,$65,$76                      ; {Continue @ $7665 [sub_7665]}
9c0f: 69 73 6e 27 74 20 67 6f   .BYTE $69,$73,$6e,$27,$74,$20,$67,$6f  ; "isn't go"
9c17: 69 6e 67 20 66 6f 72 20   .BYTE $69,$6e,$67,$20,$66,$6f,$72,$20  ; "ing for "
9c1f: 69 74 2e 0d               .BYTE $69,$74,$2e,$0d                  ; "it.\r"
9c23: ff                        .BYTE $ff                              ; {End of string}

9c24: a6 00 03  StrAttemptFail  .BYTE $a6,$00,$03                      ; {Col 0 Row 3}
9c27: a5                        .BYTE $a5                              ; {Center}
9c28: 41 74 74 65 6d 70 74 20   .BYTE $41,$74,$74,$65,$6d,$70,$74,$20  ; "Attempt "
9c30: 66 61 69 6c 65 64 2e 0d   .BYTE $66,$61,$69,$6c,$65,$64,$2e,$0d  ; "failed.\r"
9c38: ff                        .BYTE $ff                              ; {End of string}

9c39: a3 8a 9c  StrForTheCause  .BYTE $a3,$8a,$9c                      ; {Call $9c8a [setBrthrSister]}
9c3c: ac 53 76                  .BYTE $ac,$53,$76                      ; {Continue @ $7653 [StrNthFoeNmR2]}
9c3f: 73 65 65 73 20 79 6f 75   .BYTE $73,$65,$65,$73,$20,$79,$6f,$75  ; "sees you"
9c47: 20 68 61 76 65 20 6e 6f   .BYTE $20,$68,$61,$76,$65,$20,$6e,$6f  ; " have no"
9c4f: 0d                        .BYTE $0d                              ; "\r"
9c50: a5                        .BYTE $a5                              ; {Center}
9c51: b4 d9 76 0b               .BYTE $b4,$d9,$76,$0b                  ; {Print zts @ addr in $76d9 [GrbItemName_L] wid 11}
9c55: 20 61 6e 64 20 74 6f 73   .BYTE $20,$61,$6e,$64,$20,$74,$6f,$73  ; " and tos"
9c5d: 73 65 73 20 79 6f 75 20   .BYTE $73,$65,$73,$20,$79,$6f,$75,$20  ; "ses you "
9c65: 6f 6e 65 20 73 61 79 69   .BYTE $6f,$6e,$65,$20,$73,$61,$79,$69  ; "one sayi"
9c6d: 6e 67 3a 0d 0d            .BYTE $6e,$67,$3a,$0d,$0d              ; "ng:\r\r"
9c72: a5                        .BYTE $a5                              ; {Center}
9c73: 22 46 6f 72 20 74 68 65   .BYTE $22,$46,$6f,$72,$20,$74,$68,$65  ; ""For the"
9c7b: 20 63 61 75 73 65 20      .BYTE $20,$63,$61,$75,$73,$65,$20      ; " cause "
9c82: b4 db 76 0a               .BYTE $b4,$db,$76,$0a                  ; {Print zts @ addr in $76db [GenderZts_L] wid 10}
9c86: 2e 22 0d                  .BYTE $2e,$22,$0d                      ; "."\r"
9c89: ff                        .BYTE $ff                              ; {End of string}

                ; Checks the player's gender an sets GenderZts_L/H to either ZtsBrother or ZtsSister.
                ;
                ; Output
                ;   GenderZts_L/H - Set to $9ca4 [ZtsBrother] when ChrGender >= 0
                ;                   Set to $9cac [ZtsSister] when ChrGender < 0
                ;
9c8a: a9 a4     setBrthrSister  LDA #$a4             ; Set
9c8c: 8d db 76                  STA GenderZts_L      ;     GenderZts_L/H
9c8f: a9 9c                     LDA #$9c             ;     to
9c91: 8d dc 76                  STA GenderZts_H      ;     $9ca4 [ZtsBrother]
9c94: 2c 3b 63                  BIT ChrGender        ; If (ChrGender < 0)
9c97: 10 0a                     BPL loc_9ca3         ; Then
9c99: a9 ac                     LDA #$ac             ;     Set
9c9b: 8d db 76                  STA GenderZts_L      ;         GenderZts_L/H
9c9e: a9 9c                     LDA #$9c             ;         to
9ca0: 8d dc 76                  STA GenderZts_H      ;         $9cac [ZtsSister]
                                                     ; End If
9ca3: 60        loc_9ca3        RTS                  ; Return to caller

9ca4: 62 72 6f  ZtsBrother      .BYTE $62,$72,$6f          ; "bro"
9ca7: 74 68 65 72 00            .BYTE $74,$68,$65,$72,$00  ; "ther\0"

9cac: 73 69 73  ZtsSister       .BYTE $73,$69,$73          ; "sis"
9caf: 74 65 72 00               .BYTE $74,$65,$72,$00      ; "ter\0"

9cb3: ac 53 76  StrBreaksSpell  .BYTE $ac,$53,$76                      ; {Continue @ $7653 [StrNthFoeNmR2]}
9cb6: 62 72 65 61 6b 73 20 74   .BYTE $62,$72,$65,$61,$6b,$73,$20,$74  ; "breaks t"
9cbe: 68 65 20 73 70 65 6c 6c   .BYTE $68,$65,$20,$73,$70,$65,$6c,$6c  ; "he spell"
9cc6: 2e 0d                     .BYTE $2e,$0d                          ; ".\r"
9cc8: ff                        .BYTE $ff                              ; {End of string}

9cc9: a6 00 02  Str_9cc9        .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
9ccc: a5                        .BYTE $a5                              ; {Center}
9ccd: 54 68 65 20               .BYTE $54,$68,$65,$20                  ; "The "
9cd1: b4 01 aa 10               .BYTE $b4,$01,$aa,$10                  ; {Print zts @ addr in $aa01 [FoeNameZts_L] wid 16}
9cd5: 20                        .BYTE $20                              ; " "
9cd6: ac 42 aa                  .BYTE $ac,$42,$aa                      ; {Continue @ $aa42 [ModuleStart+13378]}
9cd9: 2e 0d                     .BYTE $2e,$0d                          ; ".\r"
9cdb: ff                        .BYTE $ff                              ; {End of string}

9cdc: a6 00 03  StrWt4Opening   .BYTE $a6,$00,$03                      ; {Col 0 Row 3}
9cdf: a5                        .BYTE $a5                              ; {Center}
9ce0: 59 6f 75 20 77 61 69 74   .BYTE $59,$6f,$75,$20,$77,$61,$69,$74  ; "You wait"
9ce8: 20 66 6f 72 20 61 6e 20   .BYTE $20,$66,$6f,$72,$20,$61,$6e,$20  ; " for an "
9cf0: 6f 70 65 6e 69 6e 67 2e   .BYTE $6f,$70,$65,$6e,$69,$6e,$67,$2e  ; "opening."
9cf8: 0d                        .BYTE $0d                              ; "\r"
9cf9: ff                        .BYTE $ff                              ; {End of string}

9cfa: ac 0e 9d  StrHpplyAccept  .BYTE $ac,$0e,$9d                      ; {Continue @ $9d0e [StrDrunkState]}
9cfd: 68 61 70 70 69 6c 79 20   .BYTE $68,$61,$70,$70,$69,$6c,$79,$20  ; "happily "
9d05: 61 63 63 65 70 74 2e 0d   .BYTE $61,$63,$63,$65,$70,$74,$2e,$0d  ; "accept.\r"
9d0d: ff                        .BYTE $ff                              ; {End of string}

9d0e: a6 00 02  StrDrunkState   .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
9d11: a5                        .BYTE $a5                              ; {Center}
9d12: 49 6e 20 79 6f 75 72 20   .BYTE $49,$6e,$20,$79,$6f,$75,$72,$20  ; "In your "
9d1a: 69 6e 65 62 72 69 61 74   .BYTE $69,$6e,$65,$62,$72,$69,$61,$74  ; "inebriat"
9d22: 65 64 20 73 74 61 74 65   .BYTE $65,$64,$20,$73,$74,$61,$74,$65  ; "ed state"
9d2a: 2c 20 79 6f 75 0d         .BYTE $2c,$20,$79,$6f,$75,$0d          ; ", you\r"
9d30: a5                        .BYTE $a5                              ; {Center}
9d31: ae                        .BYTE $ae                              ; {Return to prev str}

9d32: ac 0e 9d  StrDrunkRsning  .BYTE $ac,$0e,$9d                      ; {Continue @ $9d0e [StrDrunkState]}
9d35: 66 65 65 6c 20 74 68 61   .BYTE $66,$65,$65,$6c,$20,$74,$68,$61  ; "feel tha"
9d3d: 74 20 72 65 61 73 6f 6e   .BYTE $74,$20,$72,$65,$61,$73,$6f,$6e  ; "t reason"
9d45: 69 6e 67 20 77 69 74 68   .BYTE $69,$6e,$67,$20,$77,$69,$74,$68  ; "ing with"
9d4d: 20 74 68 65 0d            .BYTE $20,$74,$68,$65,$0d              ; " the\r"
9d52: a5                        .BYTE $a5                              ; {Center}
9d53: b4 01 aa 10               .BYTE $b4,$01,$aa,$10                  ; {Print zts @ addr in $aa01 [FoeNameZts_L] wid 16}
9d57: 20 69 73 20 74 68 65 20   .BYTE $20,$69,$73,$20,$74,$68,$65,$20  ; " is the "
9d5f: 62 65 73 74 20 63 6f 75   .BYTE $62,$65,$73,$74,$20,$63,$6f,$75  ; "best cou"
9d67: 72 73 65 2e 0d            .BYTE $72,$73,$65,$2e,$0d              ; "rse.\r"
9d6c: ff                        .BYTE $ff                              ; {End of string}

9d6d: ac 53 76  StrStrengthnd   .BYTE $ac,$53,$76                      ; {Continue @ $7653 [StrNthFoeNmR2]}
9d70: 61 70 70 65 61 72 73 0d   .BYTE $61,$70,$70,$65,$61,$72,$73,$0d  ; "appears\r"
9d78: a5                        .BYTE $a5                              ; {Center}
9d79: 73 74 72 65 6e 67 74 68   .BYTE $73,$74,$72,$65,$6e,$67,$74,$68  ; "strength"
9d81: 65 6e 65 64 20 62 79 20   .BYTE $65,$6e,$65,$64,$20,$62,$79,$20  ; "ened by "
9d89: 79 6f 75 72 20 61 74 74   .BYTE $79,$6f,$75,$72,$20,$61,$74,$74  ; "your att"
9d91: 61 63 6b 21 0d            .BYTE $61,$63,$6b,$21,$0d              ; "ack!\r"
9d96: ff                        .BYTE $ff                              ; {End of string}

9d97: a6 00 02  StrUAreStunned  .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
9d9a: a5                        .BYTE $a5                              ; {Center}
9d9b: 59 6f 75 20 61 72 65 20   .BYTE $59,$6f,$75,$20,$61,$72,$65,$20  ; "You are "
9da3: 73 74 75 6e 6e 65 64 2e   .BYTE $73,$74,$75,$6e,$6e,$65,$64,$2e  ; "stunned."
9dab: 0d                        .BYTE $0d                              ; "\r"
9dac: a3 af 9d                  .BYTE $a3,$af,$9d                      ; {Call $9daf [setNoOptnsStr]}

                ; Sets StrTemplate_L/H to StrNoOptions
                ;
9daf: a9 91     setNoOptnsStr   LDA #$91             ; Set
9db1: 85 16                     STA StrTmplate_L     ;     StrTmplate_L/H
9db3: a9 98                     LDA #$98             ;     to
9db5: 85 17                     STA StrTmplate_H     ;     $9891 [StrNoOptions]
9db7: 60                        RTS                  ; Return to caller

9db8: a6 00 03  StrNotLoaded    .BYTE $a6,$00,$03                      ; {Col 0 Row 3}
9dbb: a5                        .BYTE $a5                              ; {Center}
9dbc: b4 3c 9e 19               .BYTE $b4,$3c,$9e,$19                  ; {Print zts @ addr in $9e3c [StrYour+15] wid 25}
9dc0: 20 6e 6f 74 20 6c 6f 61   .BYTE $20,$6e,$6f,$74,$20,$6c,$6f,$61  ; " not loa"
9dc8: 64 65 64 2e 0d            .BYTE $64,$65,$64,$2e,$0d              ; "ded.\r"
9dcd: ff                        .BYTE $ff                              ; {End of string}

9dce: ac 65 76  StrDodges       .BYTE $ac,$65,$76                      ; {Continue @ $7665 [sub_7665]}
9dd1: 0d                        .BYTE $0d                              ; "\r"
9dd2: a5                        .BYTE $a5                              ; {Center}
9dd3: 64 6f 64 67 65 73 20 6f   .BYTE $64,$6f,$64,$67,$65,$73,$20,$6f  ; "dodges o"
9ddb: 75 74 20 6f 66 20 74 68   .BYTE $75,$74,$20,$6f,$66,$20,$74,$68  ; "ut of th"
9de3: 65 20 77 61 79 2e 0d      .BYTE $65,$20,$77,$61,$79,$2e,$0d      ; "e way.\r"
9dea: ff                        .BYTE $ff                              ; {End of string}

9deb: a6 00 03  StrYouDodge     .BYTE $a6,$00,$03                      ; {Col 0 Row 3}
9dee: a5                        .BYTE $a5                              ; {Center}
9def: 59 6f 75 20 64 6f 64 67   .BYTE $59,$6f,$75,$20,$64,$6f,$64,$67  ; "You dodg"
9df7: 65 20 74 68 65 20 62 6c   .BYTE $65,$20,$74,$68,$65,$20,$62,$6c  ; "e the bl"
9dff: 6f 77 2e 0d               .BYTE $6f,$77,$2e,$0d                  ; "ow.\r"
9e03: ff                        .BYTE $ff                              ; {End of string}

9e04: ac 2d 9e  StrAbout2Break  .BYTE $ac,$2d,$9e                      ; {Continue @ $9e2d [StrYour]}
9e07: a5                        .BYTE $a5                              ; {Center}
9e08: 69 73 20 61 62 6f 75 74   .BYTE $69,$73,$20,$61,$62,$6f,$75,$74  ; "is about"
9e10: 20 74 6f 20 62 72 65 61   .BYTE $20,$74,$6f,$20,$62,$72,$65,$61  ; " to brea"
9e18: 6b 2e 0d                  .BYTE $6b,$2e,$0d                      ; "k.\r"
9e1b: ff                        .BYTE $ff                              ; {End of string}

9e1c: ac 2d 9e  StrHasBroken    .BYTE $ac,$2d,$9e                      ; {Continue @ $9e2d [StrYour]}
9e1f: a5                        .BYTE $a5                              ; {Center}
9e20: 68 61 73 20 62 72 6f 6b   .BYTE $68,$61,$73,$20,$62,$72,$6f,$6b  ; "has brok"
9e28: 65 6e 2e 0d               .BYTE $65,$6e,$2e,$0d                  ; "en.\r"
9e2c: ff                        .BYTE $ff                              ; {End of string}

9e2d: a6 00 02  StrYour         .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
9e30: a5                        .BYTE $a5                              ; {Center}
9e31: 59 6f 75 72 20            .BYTE $59,$6f,$75,$72,$20              ; "Your "
9e36: b4 d9 76 1f               .BYTE $b4,$d9,$76,$1f                  ; {Print zts @ addr in $76d9 [GrbItemName_L] wid 31}
9e3a: 0d                        .BYTE $0d                              ; "\r"
9e3b: ae                        .BYTE $ae                              ; {Return to prev str}

9e3c: 00 00 00 00               .BYTE $00,$00,$00,$00                  ; "\0\0\0\0"

9e40: 62 61 72  ZtsBareHand     .BYTE $62,$61,$72                      ; "bar"
9e43: 65 20 68 61 6e 64 00      .BYTE $65,$20,$68,$61,$6e,$64,$00      ; "e hand\0"

9e4a: ac 53 76  StrKnockedDown  .BYTE $ac,$53,$76                      ; {Continue @ $7653 [StrNthFoeNmR2]}
9e4d: 69 73 20 6b 6e 6f 63 6b   .BYTE $69,$73,$20,$6b,$6e,$6f,$63,$6b  ; "is knock"
9e55: 65 64 20 64 6f 77 6e 0d   .BYTE $65,$64,$20,$64,$6f,$77,$6e,$0d  ; "ed down\r"
9e5d: a5                        .BYTE $a5                              ; {Center}
9e5e: 62 79 20 74 68 65 20 66   .BYTE $62,$79,$20,$74,$68,$65,$20,$66  ; "by the f"
9e66: 6f 72 63 65 20 6f 66 20   .BYTE $6f,$72,$63,$65,$20,$6f,$66,$20  ; "orce of "
9e6e: 79 6f 75 72 20 61 74 74   .BYTE $79,$6f,$75,$72,$20,$61,$74,$74  ; "your att"
9e76: 61 63 6b 2e 0d            .BYTE $61,$63,$6b,$2e,$0d              ; "ack.\r"
9e7b: ff                        .BYTE $ff                              ; {End of string}

9e7c: ac 53 76  StrIsStaggered  .BYTE $ac,$53,$76                      ; {Continue @ $7653 [StrNthFoeNmR2]}
9e7f: 69 73 20 73 74 61 67 67   .BYTE $69,$73,$20,$73,$74,$61,$67,$67  ; "is stagg"
9e87: 65 72 65 64 0d            .BYTE $65,$72,$65,$64,$0d              ; "ered\r"
9e8c: ac 5d 9e                  .BYTE $ac,$5d,$9e                      ; {Continue @ $9e5d [StrKnockedDown+19]}

9e8f: a6 00 02  StrYouAttack    .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
9e92: a3 80 9f                  .BYTE $a3,$80,$9f                      ; {Call $9f80 [sub_9f80]}
9e95: a5                        .BYTE $a5                              ; {Center}
9e96: 59 6f 75 20               .BYTE $59,$6f,$75,$20                  ; "You "
9e9a: b4 7e 9f 0f               .BYTE $b4,$7e,$9f,$0f                  ; {Print zts @ addr in $9f7e [AttckDescZts_L] wid 15}
9e9e: 20 74 68 65 20            .BYTE $20,$74,$68,$65,$20              ; " the "
9ea3: b4 01 aa 14               .BYTE $b4,$01,$aa,$14                  ; {Print zts @ addr in $aa01 [FoeNameZts_L] wid 20}
9ea7: 0d                        .BYTE $0d                              ; "\r"
9ea8: a5                        .BYTE $a5                              ; {Center}
9ea9: 77 69 74 68 20 79 6f 75   .BYTE $77,$69,$74,$68,$20,$79,$6f,$75  ; "with you"
9eb1: 72 20                     .BYTE $72,$20                          ; "r "
9eb3: b4 3c 9e 1e               .BYTE $b4,$3c,$9e,$1e                  ; {Print zts @ addr in $9e3c [StrYour+15] wid 30}
9eb7: 0d                        .BYTE $0d                              ; "\r"
9eb8: a3 e5 9e                  .BYTE $a3,$e5,$9e                      ; {Call $9ee5 [sub_9ee5]}

9ebb: a3 fc 9e  StrFor          .BYTE $a3,$fc,$9e                      ; {Call $9efc [disableNumPad]}
9ebe: a5                        .BYTE $a5                              ; {Center}
9ebf: 20 66 6f 72 20            .BYTE $20,$66,$6f,$72,$20              ; " for "
9ec4: b1 a7 00 06               .BYTE $b1,$a7,$00,$06                  ; {Print uint16 @ $00a7 [dat_00a7_H] wid 6}
9ec8: 2e 0d                     .BYTE $2e,$0d                          ; ".\r"
9eca: a3 02 9f                  .BYTE $a3,$02,$9f                      ; {Call $9f02 [enableNumPad]}
9ecd: ff                        .BYTE $ff                              ; {End of string}

9ece: a5        StrHasNoEffect  .BYTE $a5                              ; {Center}
9ecf: 77 68 69 63 68 20 68 61   .BYTE $77,$68,$69,$63,$68,$20,$68,$61  ; "which ha"
9ed7: 73 20 6e 6f 20 65 66 66   .BYTE $73,$20,$6e,$6f,$20,$65,$66,$66  ; "s no eff"
9edf: 65 63 74 21 0d            .BYTE $65,$63,$74,$21,$0d              ; "ect!\r"
9ee4: ff                        .BYTE $ff                              ; {End of string}

                ;
                ;
                ;
9ee5: a9 bb     sub_9ee5        LDA #$bb             ; Set
9ee7: 85 16                     STA StrTmplate_L     ;     StrTmplate_L/H
9ee9: a9 9e                     LDA #$9e             ;     to
9eeb: 85 17                     STA StrTmplate_H     ;     $9ebb [StrFor]
9eed: a5 a7                     LDA dat_00a7_H       ; If
9eef: 05 a8                     ORA dat_00a8_L       ;    ((dat_00a7_H | dat_00a8_L) == 0)
9ef1: d0 08                     BNE loc_9efb         ; Then
9ef3: a9 ce                     LDA #$ce             ;     Set
9ef5: 85 16                     STA StrTmplate_L     ;         StrTmplate_L/H
9ef7: a9 9e                     LDA #$9e             ;         to
9ef9: 85 17                     STA StrTmplate_H     ;         $9ece [StrHasNoEffect]
                                                     ; End If
9efb: 60        loc_9efb        RTS                  ; Return to caller

9efc: a9 ff     disableNumPad   LDA #$ff             ; Set
9efe: 8d fe 18                  STA NoNumPadFlg      ;     NoNumPadFlg = $ff
9f01: 60                        RTS                  ; Return to caller

9f02: a9 00     enableNumPad    LDA #$00             ; Set
9f04: 8d fe 18                  STA NoNumPadFlg      ;     NoNumPadFlg = 0
9f07: 60                        RTS                  ; Return to caller

9f08: 68 61 63  ZtsHack         .BYTE $68,$61,$63      ; "hac"
9f0b: 6b 00                     .BYTE $6b,$00          ; "k\0"

9f0d: 70 6f 6b  ZtsPoke         .BYTE $70,$6f,$6b      ; "pok"
9f10: 65 00                     .BYTE $65,$00          ; "e\0"

9f12: 62 61 73  ZtsBash         .BYTE $62,$61,$73      ; "bas"
9f15: 68 00                     .BYTE $68,$00          ; "h\0"

9f17: 73 70 65  ZtsSpear        .BYTE $73,$70,$65      ; "spe"
9f1a: 61 72 00                  .BYTE $61,$72,$00      ; "ar\0"

9f1d: 77 68 69  ZtsWhip         .BYTE $77,$68,$69      ; "whi"
9f20: 70 00                     .BYTE $70,$00          ; "p\0"

9f22: 7a 61 70  ZtsZap          .BYTE $7a,$61,$70      ; "zap"
9f25: 00                        .BYTE $00              ; "\0"

9f26: 70 75 6e  ZtsPunch        .BYTE $70,$75,$6e      ; "pun"
9f29: 63 68 00                  .BYTE $63,$68,$00      ; "ch\0"

9f2c: 68 69 74  ZtsHit          .BYTE $68,$69,$74      ; "hit"
9f2f: 00                        .BYTE $00              ; "\0"

9f30: 73 6c 61  ZtsSlash        .BYTE $73,$6c,$61      ; "sla"
9f33: 73 68 00                  .BYTE $73,$68,$00      ; "sh\0"

9f36: 73 74 61  ZtsStab         .BYTE $73,$74,$61      ; "sta"
9f39: 62 00                     .BYTE $62,$00          ; "b\0"

9f3b: 77 61 6c  ZtsWallop       .BYTE $77,$61,$6c      ; "wal"
9f3e: 6c 6f 70 00               .BYTE $6c,$6f,$70,$00  ; "lop\0"

9f42: 69 6d 70  ZtsImpale       .BYTE $69,$6d,$70      ; "imp"
9f45: 61 6c 65 00               .BYTE $61,$6c,$65,$00  ; "ale\0"

9f49: 6c 61 73  ZtsLash         .BYTE $6c,$61,$73      ; "las"
9f4c: 68 00                     .BYTE $68,$00          ; "h\0"

9f4e: 62 6c 61  ZtsBlast        .BYTE $62,$6c,$61      ; "bla"
9f51: 73 74 00                  .BYTE $73,$74,$00      ; "st\0"

9f54: 77 68 6f  ZtsWhomp        .BYTE $77,$68,$6f      ; "who"
9f57: 6d 70 00                  .BYTE $6d,$70,$00      ; "mp\0"

9f5a: 68 69 74  ZtsHit2         .BYTE $68,$69,$74      ; "hit"
9f5d: 00                        .BYTE $00              ; "\0"

9f5e: 08 0d 12  AttckDescs1_L   .BYTE $08,$0d,$12          ; 8 bytes: LSB of player attack description Zts addresses
9f61: 17 1d 22 26 2c            .BYTE $17,$1d,$22,$26,$2c  ;

9f66: 9f 9f 9f  AttckDescs1_H   .BYTE $9f,$9f,$9f          ; 8 bytes: MSB of player attack description Zts addresses
9f69: 9f 9f 9f 9f 9f            .BYTE $9f,$9f,$9f,$9f,$9f  ;    0: $9f08 [ZtsHack]         4: $9f1d [ZtsWhip]
                                                           ;    1: $9f0d [ZtsPoke]         5: $9f22 [ZtsZap]
                                                           ;    2: $9f12 [ZtsBash]         6: $9f26 [ZtsPunch]
                                                           ;    3: $9f17 [ZtsSpear]        7: $9f2c [ZtsHit]

9f6e: 30 36 3b  AttckDescs2_L   .BYTE $30,$36,$3b          ; 8 bytes: LSB of player attack secondary description Zts
9f71: 42 49 4e 54 5a            .BYTE $42,$49,$4e,$54,$5a  ;          addresses

9f76: 9f 9f 9f  AttckDescs2_H   .BYTE $9f,$9f,$9f          ; 8 bytes: MSB of player attack secondary description Zts
9f79: 9f 9f 9f 9f 9f            .BYTE $9f,$9f,$9f,$9f,$9f  ;          addresses
                                                           ;    0: $9f30 [ZtsSlash]        4: $9f49 [ZtsLash]
                                                           ;    1: $9f36 [ZtsStab]         5: $9f4e [ZtsBlast]
                                                           ;    2: $9f3b [ZtsWallop]       6: $9f54 [ZtsWhomp]
                                                           ;    3: $9f42 [ZtsImpale]       7: $9f5a [ZtsHit2]

9f7e: 00        AttckDescZts_L  .BYTE $00            ; LSB of player attack description Zts address
9f7f: 00        AttckDescZts_H  .BYTE $00            ; MSB of player attack description Zts address

                ;
                ; Called from StrYouAttack
                ;
                ; Input
                ;   ChrPriWeapon
                ;   dat_009b
                ;
                ;
9f80: a2 06     sub_9f80        LDX #$06             ; Set X = 6                        (6 = punch/whomp)
9f82: 2c 9c 63                  BIT ChrPriWeapon     ; If (ChrPriWeapon >= 0)           (weapon equipped)
9f85: 30 07                     BMI loc_9f8e         ; Then
9f87: a0 0f                     LDY #$0f             ;     Set Y = 15
9f89: b1 64                     LDA (dat_0064_L),Y   ;     Set X
9f8b: 29 07                     AND #$07             ;           =
9f8d: aa                        TAX                  ;             (*dat_0064_L)[15] & 7
                                                     ; End If
9f8e: bd 5e 9f  loc_9f8e        LDA AttckDescs1_L,X  ; Set
9f91: 8d 7e 9f                  STA AttckDescZts_L   ;     AttckDescZts_L/H
9f94: bd 66 9f                  LDA AttckDescs1_H,X  ;     to
9f97: 8d 7f 9f                  STA AttckDescZts_H   ;     AttckDescs1_L/H[X]
9f9a: a5 9b                     LDA dat_009b         ; If
9f9c: 30 0e                     BMI loc_9fac         ;    (dat_009b <= 0)
9f9e: f0 0c                     BEQ loc_9fac         ; Then
9fa0: bd 6e 9f                  LDA AttckDescs2_L,X  ;     Set
9fa3: 8d 7e 9f                  STA AttckDescZts_L   ;         AttckDescZts_L/H
9fa6: bd 76 9f  loc_9fa6        LDA AttckDescs2_H,X  ;         to
9fa9: 8d 7f 9f                  STA AttckDescZts_H   ;         AttckDescs2_L/H[X]
                                                     ; End If
9fac: 60        loc_9fac        RTS                  ; Return to caller

9fad: a3 fc 9e  StrPointsOfDmg  .BYTE $a3,$fc,$9e                      ; {Call $9efc [disableNumPad]}
9fb0: a3 dd 9f                  .BYTE $a3,$dd,$9f                      ; {Call $9fdd [setFoeHitFor]}
9fb3: a6 00 03                  .BYTE $a6,$00,$03                      ; {Col 0 Row 3}
9fb6: a5                        .BYTE $a5                              ; {Center}
9fb7: 54 68 65 20               .BYTE $54,$68,$65,$20                  ; "The "
9fbb: ad db 9f                  .BYTE $ad,$db,$9f                      ; {Cont. @ addr in $9fdb [ForHitForStr_L]}
9fbe: 0d                        .BYTE $0d                              ; "\r"
9fbf: a5                        .BYTE $a5                              ; {Center}
9fc0: b1 a7 00 05               .BYTE $b1,$a7,$00,$05                  ; {Print uint16 @ $00a7 [dat_00a7_H] wid 5}
9fc4: 20 70 6f 69 6e 74 73 20   .BYTE $20,$70,$6f,$69,$6e,$74,$73,$20  ; " points "
9fcc: 6f 66 20 64 61 6d 61 67   .BYTE $6f,$66,$20,$64,$61,$6d,$61,$67  ; "of damag"
9fd4: 65 2e 0d                  .BYTE $65,$2e,$0d                      ; "e.\r"
9fd7: a3 02 9f                  .BYTE $a3,$02,$9f                      ; {Call $9f02 [enableNumPad]}
9fda: ff                        .BYTE $ff                              ; {End of string}

9fdb: 00        ForHitForStr_L  .BYTE $00            ; LSB of template string assigned by setForHitFor
9fdc: 00        ForHitForStr_H  .BYTE $00            ; MSB of template string assigned by setForHitFor

                ; Sets ForHitForStr_L/H to StrIsHitFor if FoeCount = 1 or Chr_MagicalDmg = 0,
                ;     and StrAreHitFor otherwise.
                ;
                ; Input
                ;   FoeCount       -
                ;   Chr_MagicalDmg -
                ;
                ; Output
                ;   ForHitForStr_L/H - Set to StrIsHitFor if FoeCount = 1 or Chr_MagicalDmg = 0
                ;                      Set to StrAreHitFor if FoeCount != 1 and Chr_MagicalDmg != 0
                ;
9fdd: a9 fe     setFoeHitFor    LDA #$fe             ; Set
9fdf: 8d db 9f                  STA ForHitForStr_L   ;     ForHitForStr_L/H
9fe2: a9 9f                     LDA #$9f             ;     to
9fe4: 8d dc 9f                  STA ForHitForStr_H   ;     $9ffe [StrIsHitFor]
9fe7: ad 00 aa                  LDA FoeCount         ; If
9fea: c9 01                     CMP #$01             ;    (FoeCount != 1)
9fec: f0 0f                     BEQ loc_9ffd         ;    And
9fee: ad e8 63                  LDA Chr_MagicalDmg   ;    (Chr_MagicalDmg != 0)
9ff1: f0 0a                     BEQ loc_9ffd         ; Then
9ff3: a9 0e                     LDA #$0e             ;     Set
9ff5: 8d db 9f                  STA ForHitForStr_L   ;         ForHitForStr_L/H
9ff8: a9 a0                     LDA #$a0             ;         to
9ffa: 8d dc 9f                  STA ForHitForStr_H   ;         $a00e [StrAreHitFor]
                                                     ; End If
9ffd: 60        loc_9ffd        RTS                  ; Return to caller

9ffe: b4 01 aa  StrIsHitFor     .BYTE $b4,$01,$aa                      ; {Print zts @ addr in $aa01 [FoeNameZts_L]
a001: 10                        .BYTE $10                              ;     wid 16}
a002: 20 69 73 20 68 69 74 20   .BYTE $20,$69,$73,$20,$68,$69,$74,$20  ; " is hit "
a00a: 66 6f 72                  .BYTE $66,$6f,$72                      ; "for"
a00d: ae                        .BYTE $ae                              ; {Return to prev str}

a00e: b4 03 aa  StrAreHitFor    .BYTE $b4,$03,$aa                      ; {Print zts @ addr in $aa03 [FoeNameZts2_L]
a011: 10                        .BYTE $10                              ;     wid 16}
a012: 20 61 72 65 20 68 69 74   .BYTE $20,$61,$72,$65,$20,$68,$69,$74  ; " are hit"
a01a: 20 66 6f 72               .BYTE $20,$66,$6f,$72                  ; " for"
a01e: ae                        .BYTE $ae                              ; {Return to prev str}

a01f: 62 61 72  ZtsBareHand2    .BYTE $62,$61,$72                      ; "bar"
a022: 65 20 68 61 6e 64 00      .BYTE $65,$20,$68,$61,$6e,$64,$00      ; "e hand\0"

a029: a3 4f a0  StrYouEncnter   .BYTE $a3,$4f,$a0                      ; {Call $a04f [sub_a04f]}
a02c: a6 00 05                  .BYTE $a6,$00,$05                      ; {Col 0 Row 5}
a02f: a9                        .BYTE $a9                              ; {Clear row}
a030: a2                        .BYTE $a2                              ; {Center w/clear left}
a031: 59 6f 75 20 65 6e 63 6f   .BYTE $59,$6f                          ; "You enco"
a039: 75 6e 74 65 72 20 61      .BYTE $75,$6e,$74,$65,$72,$20,$61      ; "unter a"
a040: b3 a3 a0 01               .BYTE $b3,$a3,$a0,$01                  ; {Print zts @ $a0a3 [dat_a0a3] wid 1}
a044: 20                        .BYTE $20                              ; " "
a045: b4 4d a0 10               .BYTE $b4,$4d,$a0,$10                  ; {Print zts @ addr in $a04d [dat_a04d] wid 16}
a049: 2e                        .BYTE $2e                              ; "."
a04a: ab                        .BYTE $ab                              ; {Clear to EOL}
a04b: 0d                        .BYTE $0d                              ; "\r"
a04c: ff                        .BYTE $ff                              ; {End of string}

a04d: 00        dat_a04d_L      .BYTE $00            ;
a04e: 00        dat_a04d_H      .BYTE $00            ;

                ;
                ; Input
                ;   dat_008a       - Number of foes
                ;
                ; Output
                ;   dat_a04d_L/H   - Assigned the foe singular or plural name
                ;
                ;
a04f: ad 01 aa  sub_a04f        LDA FoeNameZts_L     ; Set
a052: 8d 4d a0                  STA dat_a04d_L       ;     dat_a04d_L/H
a055: ad 02 aa                  LDA FoeNameZts_H     ;     to
a058: 8d 4e a0                  STA dat_a04d_H       ;     FoeNameZts_L/H
a05b: ad 01 aa                  LDA FoeNameZts_L     ; Set
a05e: 8d 74 a0                  STA dat_a074_L       ;     smc_a073[1..2]
a061: ad 02 aa                  LDA FoeNameZts_H     ;     to
a064: 8d 75 a0                  STA dat_a074_H       ;     FoeNameZts_L/H
a067: a9 61                     LDA #$61             ; Set
a069: 8d 3f a0                  STA dat_a03f         ;     dat_a03f = $61 (97 'a')
a06c: a2 04                     LDX #$04             ; Set X = 4  (5 iterations [4..0])
a06e: a0 00                     LDY #$00             ; Set
a070: 8c a3 a0                  STY dat_a0a3         ;     dat_a0a3 = 0
a073: ad ff ff  smc_a073        LDA $ffff            ; Set A = (*FoeNameZts_L)[0]
a076: 20 3f 18                  JSR j_charToUpper    ; Call $183f [j_charToUpper]
a079: dd a5 a0  loc_a079        CMP dat_a0a5,X       ; Loop
a07c: d0 05                     BNE loc_a083         ;     If (A == dat_a0a5[X]) Then
a07e: a9 6e                     LDA #$6e             ;         Set
a080: 8d a3 a0                  STA dat_a0a3         ;             dat_a0a3 = $6e (110 'n')
                                                     ;     End If
a083: ca        loc_a083        DEX                  ;     Subtract 1 from X
a084: 10 f3                     BPL loc_a079         ; Repeat while (X >= 0)
a086: a5 8a                     LDA dat_008a         ; If
a088: c9 01                     CMP #$01             ;    (dat_008a != 1)
a08a: f0 16                     BEQ loc_a0a2         ; Then
a08c: 09 30                     ORA #$30             ;     Set
a08e: 8d 3f a0                  STA dat_a03f         ;         dat_a03f = dat_008a | $30        (convert to ASCII digit)
a091: a9 00                     LDA #$00             ;     Set
a093: 8d a3 a0                  STA dat_a0a3         ;         dat_a0a3 = 0
a096: ad 03 aa                  LDA FoeNameZts2_L    ;     Set
a099: 8d 4d a0                  STA dat_a04d_L       ;         dat_a04d_L/H
a09c: ad 04 aa                  LDA FoeNameZts2_H    ;         to
a09f: 8d 4e a0                  STA dat_a04d_H       ;         FoeNameZts2_L/H
                                                     ; End If
a0a2: 60        loc_a0a2        RTS                  ; Return to caller

a0a3: 00 00 41  dat_a0a3        .BYTE $00,$00,$41                  ; ..A
a0a6: 45 49 4f 55               .BYTE $45,$49,$4f,$55              ; EIOU

a0aa: a3 4f a0  StrYouFace      .BYTE $a3,$4f,$a0                      ; {Call $a04f [sub_a04f]}
a0ad: a6 00 05                  .BYTE $a6,$00,$05                      ; {Col 0 Row 5}
a0b0: a2                        .BYTE $a2                              ; {Center w/clear left}
a0b1: 59 6f 75 20 66 61 63 65   .BYTE $59,$6f,$75,$20,$66,$61,$63,$65  ; "You face"
a0b9: ac 3e a0                  .BYTE $ac,$3e,$a0                      ; {Continue @ $a03e [StrYouEncnter+21]}

a0bc: a6 00 05  StrClrRow5      .BYTE $a6,$00,$05                      ; {Col 0 Row 5}
a0bf: a9                        .BYTE $a9                              ; {Clear row}
a0c0: ff                        .BYTE $ff                              ; {End of string}

a0c1: a6 00 03  StrSwitchingTo  .BYTE $a6,$00,$03                      ; {Col 0 Row 3}
a0c4: a5                        .BYTE $a5                              ; {Center}
a0c5: 53 77 69 74 63 68 69 6e   .BYTE $53,$77,$69,$74,$63,$68,$69,$6e  ; "Switchin"
a0cd: 67 20 74 6f 20            .BYTE $67,$20,$74,$6f,$20              ; "g to "
a0d2: b4 3c 9e 19               .BYTE $b4,$3c,$9e,$19                  ; {Print zts @ addr in $9e3c [StrYour+15] wid 25}
a0d6: 2e 0d                     .BYTE $2e,$0d                          ; ".\r"
a0d8: ff                        .BYTE $ff                              ; {End of string}

a0d9: a6 00 03  StrYouMiss      .BYTE $a6,$00,$03                      ; {Col 0 Row 3}
a0dc: a5                        .BYTE $a5                              ; {Center}
a0dd: 59 6f 75 20 6d 69 73 73   .BYTE $59,$6f,$75,$20,$6d,$69,$73,$73  ; "You miss"
a0e5: 2e 0d                     .BYTE $2e,$0d                          ; ".\r"
a0e7: ff                        .BYTE $ff                              ; {End of string}

a0e8: ac 65 76  StrItDeflects   .BYTE $ac,$65,$76                      ; {Continue @ $7665 [StrNthFoeNmR3]}
a0eb: 73 6b 69 6c 6c 66 75 6c   .BYTE $73,$6b,$69,$6c,$6c,$66,$75,$6c  ; "skillful"
a0f3: 6c 79 20 0d               .BYTE $6c,$79,$20,$0d                  ; "ly \r"
a0f7: a5                        .BYTE $a5                              ; {Center}
a0f8: 64 65 66 6c 65 63 74 73   .BYTE $64,$65,$66,$6c,$65,$63,$74,$73  ; "deflects"
a100: 20 79 6f 75 72 20 61 74   .BYTE $20,$79,$6f,$75,$72,$20,$61,$74  ; " your at"
a108: 74 61 63 6b 2e 0d         .BYTE $74,$61,$63,$6b,$2e,$0d          ; "tack.\r"
a10e: ff                        .BYTE $ff                              ; {End of string}

a10f: a6 00 03  StrTakesOfr     .BYTE $a6,$00,$03                      ; {Col 0 Row 3}
a112: a3 15 a1                  .BYTE $a3,$15,$a1                      ; {Call $a115 [setTakeOfrStr]}

                ; Sets StrTmplate_L/H to StrItTakesOfr when FoeCount = 1, otherwise sets to StrItTakesOfr2.
                ;
                ; Input
                ;   FoeCount  -
                ;
                ; Output
                ;   StrTmplate_L/H - Set to StrItTakesOfr when FoeCount = 1,
                ;                    otherwise set to StrItTakesOfr2.
                ;
a115: a9 2d     setTakeOfrStr   LDA #$2d             ; Set
a117: 85 16                     STA StrTmplate_L     ;     StrTmplate_L/H
a119: a9 a1                     LDA #$a1             ;     to
a11b: 85 17                     STA StrTmplate_H     ;     $a12d [StrItTakesOfr]
a11d: ad 00 aa                  LDA FoeCount         ; If
a120: c9 01                     CMP #$01             ;    (FoeCount != 1)
a122: f0 08                     BEQ loc_a12c         ; Then
a124: a9 4a                     LDA #$4a             ;     Set
a126: 85 16                     STA StrTmplate_L     ;         StrTmplate_L/H
a128: a9 a1                     LDA #$a1             ;         to
a12a: 85 17                     STA StrTmplate_H     ;         $a14a [StrItTakesOfr2]
a12c: 60        loc_a12c        RTS                  ; Return to caller

a12d: a5        StrItTakesOfr   .BYTE $a5                              ; {Center}
a12e: 54 68 65 20               .BYTE $54,$68,$65,$20                  ; "The "
a132: b4 01 aa 10               .BYTE $b4,$01,$aa,$10                  ; {Print zts @ addr in $aa01 [FoeNameZts_L] wid 16}
a136: 20 74 61 6b 65 73 20 79   .BYTE $20,$74,$61,$6b,$65,$73,$20,$79  ; " takes y"
a13e: 6f 75 72 20 6f 66 66 65   .BYTE $6f,$75,$72,$20,$6f,$66,$66,$65  ; "our offe"
a146: 72 2e 0d                  .BYTE $72,$2e,$0d                      ; "r.\r"
a149: ff                        .BYTE $ff                              ; {End of string}

a14a: a5        StrItTakesOfr2  .BYTE $a5                              ; {Center}
a14b: 54 68 65 20               .BYTE $54,$68,$65,$20                  ; "The "
a14f: b4 03 aa 10               .BYTE $b4,$03,$aa,$10                  ; {Print zts @ addr in $aa03 [FoeNameZts2_L] wid 16}
a153: 20 74 61 6b 65 20 79 6f   .BYTE $20,$74,$61,$6b,$65,$20,$79,$6f  ; " take yo"
a15b: 75 72 20 6f 66 66 65 72   .BYTE $75,$72,$20,$6f,$66,$66,$65,$72  ; "ur offer"
a163: 2e 0d                     .BYTE $2e,$0d                          ; ".\r"
a165: ff                        .BYTE $ff                              ; {End of string}

a166: a3 81 a1  StrItSpllEffct  .BYTE $a3,$81,$a1                      ; {Call $a181 [setSpllEfctStr]}
a169: a5                        .BYTE $a5                              ; {Center}
a16a: 54 68 65 20               .BYTE $54,$68,$65,$20                  ; "The "
a16e: b4 01 aa 10               .BYTE $b4,$01,$aa,$10                  ; {Print zts @ addr in $aa01 [FoeNameZts_L] wid 16}
a172: 20                        .BYTE $20                              ; " "
a173: ad a8 a1                  .BYTE $ad,$a8,$a1                      ; {Cont. @ addr in $a1a8 [SpllEfctStr_L]}
a176: 2e 0d                     .BYTE $2e,$0d                          ; ".\r"
a178: ff                        .BYTE $ff                              ; {End of string}

a179: 54 68 65  ZtsThe2         .BYTE $54,$68,$65    ; "The"
a17c: 00                        .BYTE $00            ; "\0"

a17d: 4f 6e 65  ZtsOne          .BYTE $4f,$6e,$65    ; "One"
a180: 00                        .BYTE $00            ; "\0"

                ; Determines the effect description string to display for the spell damage applied.
                ;
                ; Input
                ;   dat_0078    - ?Amount of damage applied?
                ;
                ; Output
                ;   SpllEfctStr_L/H - Set to one of the following:
                ;                       - $a1aa [StrTkesFlEffct] when dat_0078 < 0
                ;                       - $a1c0 [StrRsistsEffct] when dat_0078 != 0
                ;                       - $a1d4 [StrRepelsEffct] when dat_0078 == 0
                ;
a181: a9 aa     setSpllEfctStr  LDA #$aa             ; Set
a183: 8d a8 a1                  STA SpllEfctStr_L    ;     SpllEfctStr_L/H
a186: a9 a1                     LDA #$a1             ;     to
a188: 8d a9 a1                  STA SpllEfctStr_H    ;     $a1aa [StrTkesFlEffct]
a18b: a5 78                     LDA dat_0078         ; If (dat_0078 < 0) Then
a18d: 10 01                     BPL loc_a190         ;     Return to caller
a18f: 60                        RTS                  ; End If
a190: f0 0b     loc_a190        BEQ loc_a19d         ; If (dat_0078 != 0) Then
a192: a9 c0                     LDA #$c0             ;     Set
a194: 8d a8 a1                  STA SpllEfctStr_L    ;         SpllEfctStr_L/H
a197: a9 a1                     LDA #$a1             ;         to
a199: 8d a9 a1                  STA SpllEfctStr_H    ;         $a1c0 [StrRsistsEffct]
a19c: 60                        RTS                  ;     Return to caller
                                                     ; End If
a19d: a9 d4     loc_a19d        LDA #$d4             ; Set
a19f: 8d a8 a1                  STA SpllEfctStr_L    ;     SpllEfctStr_L/H
a1a2: a9 a1                     LDA #$a1             ;     to
a1a4: 8d a9 a1                  STA SpllEfctStr_H    ;     $a1d4 [StrRepelsEffct]
a1a7: 60                        RTS                  ; Return to caller

a1a8: 00        SpllEfctStr_L   .BYTE $00            ; LSB of spell effect str address
a1a9: 00        SpllEfctStr_H   .BYTE $00            ; MSB of spell effect str address

a1aa: 74 61 6b  StrTkesFlEffct  .BYTE $74,$61,$6b                      ; "tak"
a1ad: 65 73 20 74 68 65 20 66   .BYTE $65,$73,$20,$74,$68,$65,$20,$66  ; "es the f"
a1b5: 75 6c 6c 20 65 66 66 65   .BYTE $75,$6c,$6c,$20,$65,$66,$66,$65  ; "ull effe"
a1bd: 63 74                     .BYTE $63,$74                          ; "ct"
a1bf: ae                        .BYTE $ae                              ; {Return to prev str}

a1c0: 72 65 73  StrRsistsEffct  .BYTE $72,$65,$73                      ; "res"
a1c3: 69 73 74 73 20 74 68 65   .BYTE $69,$73,$74,$73,$20,$74,$68,$65  ; "ists the"
a1cb: 20 65 66 66 65 63 74 73   .BYTE $20,$65,$66,$66,$65,$63,$74,$73  ; " effects"
a1d3: ae                        .BYTE $ae                              ; {Return to prev str}

a1d4: 72 65 70  StrRepelsEffct  .BYTE $72,$65,$70                      ; "rep"
a1d7: 65 6c 73 20 74 68 65 20   .BYTE $65,$6c,$73,$20,$74,$68,$65,$20  ; "els the "
a1df: 65 66 66 65 63 74 73      .BYTE $65,$66,$66,$65,$63,$74,$73      ; "effects"
a1e6: ae                        .BYTE $ae                              ; {Return to prev str}

a1e7: a6 00 03  StrIsBewildrd   .BYTE $a6,$00,$03                      ; {Col 0 Row 3}
a1ea: a5                        .BYTE $a5                              ; {Center}
a1eb: 2e 2e 2e                  .BYTE $2e,$2e,$2e                      ; "..."
a1ee: b4 01 aa 10               .BYTE $b4,$01,$aa,$10                  ; {Print zts @ addr in $aa01 [FoeNameZts_L] wid 16}
a1f2: 20 69 73 20 62 65 77 69   .BYTE $20,$69,$73,$20,$62,$65,$77,$69  ; " is bewi"
a1fa: 6c 64 65 72 65 64 2c 0d   .BYTE $6c,$64,$65,$72,$65,$64,$2c,$0d  ; "ldered,\r"
a202: ff                        .BYTE $ff                              ; {End of string}

a203: ac 65 76  StrItDrnksPtn   .BYTE $ac,$65,$76                      ; {Continue @ $7665 [StrNthFoeNmR3]}
a206: 64 72 69 6e 6b 73 20 61   .BYTE $64,$72,$69,$6e,$6b,$73,$20,$61  ; "drinks a"
a20e: 20 70 6f 74 69 6f 6e 0d   .BYTE $20,$70,$6f,$74,$69,$6f,$6e,$0d  ; " potion\r"
a216: a5                        .BYTE $a5                              ; {Center}
a217: 61 6e 64 20 69 73 20 68   .BYTE $61,$6e,$64,$20,$69,$73,$20,$68  ; "and is h"
a21f: 65 61 6c 65 64 2e 0d      .BYTE $65,$61,$6c,$65,$64,$2e,$0d      ; "ealed.\r"
a226: ff                        .BYTE $ff                              ; {End of string}

a227: 62 75 74  ZtsButItFails   .BYTE $62,$75,$74                      ; "but"
a22a: 20 69 74 20 66 61 69 6c   .BYTE $20,$69,$74,$20,$66,$61,$69,$6c  ; " it fail"
a232: 73 21 00                  .BYTE $73,$21,$00                      ; "s!\0"

a235: ac 53 76  StrCasts        .BYTE $ac,$53,$76                      ; {Continue @ $7653 [StrNthFoeNmR2]}
a238: 63 61 73 74 73 0d         .BYTE $63,$61,$73,$74,$73,$0d          ; "casts\r"
a23e: a5                        .BYTE $a5                              ; {Center}
a23f: b4 d9 76 14               .BYTE $b4,$d9,$76,$14                  ; {Print zts @ addr in $76d9 [GrbItemName_L] wid 20}
a243: 2e 2e 2e 0d               .BYTE $2e,$2e,$2e,$0d                  ; "...\r"
a247: a5                        .BYTE $a5                              ; {Center}
a248: b4 db 76 1e               .BYTE $b4,$db,$76,$1e                  ; {Print zts @ addr in $76db [GenderZts_L] wid 30}
a24c: 0d                        .BYTE $0d                              ; "\r"
a24d: ff                        .BYTE $ff                              ; {End of string}

a24e: a6 00 03  StrRiseFrmGrnd  .BYTE $a6,$00,$03                      ; {Col 0 Row 3}
a251: a5                        .BYTE $a5                              ; {Center}
a252: 59 6f 75 20 72 69 73 65   .BYTE $59,$6f,$75,$20,$72,$69,$73,$65  ; "You rise"
a25a: 20 66 72 6f 6d 20 74 68   .BYTE $20,$66,$72,$6f,$6d,$20,$74,$68  ; " from th"
a262: 65 20 67 72 6f 75 6e 64   .BYTE $65,$20,$67,$72,$6f,$75,$6e,$64  ; "e ground"
a26a: 2e 0d                     .BYTE $2e,$0d                          ; ".\r"
a26c: ff                        .BYTE $ff                              ; {End of string}

a26d: ac 65 76  StrGetsUp       .BYTE $ac,$65,$76                      ; {Continue @ $7665 [StrNthFoeNmR3]}
a270: 67 65 74 73 20 75 70 2e   .BYTE $67,$65,$74,$73,$20,$75,$70,$2e  ; "gets up."
a278: 0d                        .BYTE $0d                              ; "\r"
a279: ff                        .BYTE $ff                              ; {End of string}

a27a: ac 65 76  StrMisses       .BYTE $ac,$65,$76                      ; {Continue @ $7665 [StrNthFoeNmR3]}
a27d: 6d 69 73 73 65 73 2e 0d   .BYTE $6d,$69,$73,$73,$65,$73,$2e,$0d  ; "misses.\r"
a285: ff                        .BYTE $ff                              ; {End of string}

a286: ac 65 76  StrWaitOpening  .BYTE $ac,$65,$76                      ; {Continue @ $7665 [StrNthFoeNmR3]}
a289: 77 61 69 74 73 0d         .BYTE $77,$61,$69,$74,$73,$0d          ; "waits\r"
a28f: a5                        .BYTE $a5                              ; {Center}
a290: 66 6f 72 20 61 6e 20 6f   .BYTE $66,$6f,$72,$20,$61,$6e,$20,$6f  ; "for an o"
a298: 70 65 6e 69 6e 67 2e 0d   .BYTE $70,$65,$6e,$69,$6e,$67,$2e,$0d  ; "pening.\r"
a2a0: ff                        .BYTE $ff                              ; {End of string}

a2a1: a6 00 03  StrFlStrngthnd  .BYTE $a6,$00,$03                      ; {Col 0 Row 3}
a2a4: a5                        .BYTE $a5                              ; {Center}
a2a5: 59 6f 75 20 66 65 65 6c   .BYTE $59,$6f,$75,$20,$66,$65,$65,$6c  ; "You feel"
a2ad: 20 73 74 72 65 6e 67 74   .BYTE $20,$73,$74,$72,$65,$6e,$67,$74  ; " strengt"
a2b5: 68 65 6e 65 64 20 66 72   .BYTE $68,$65,$6e,$65,$64,$20,$66,$72  ; "hened fr"
a2bd: 6f 6d 20 74 68 65 20 61   .BYTE $6f,$6d,$20,$74,$68,$65,$20,$61  ; "om the a"
a2c5: 74 74 61 63 6b 21 0d      .BYTE $74,$74,$61,$63,$6b,$21,$0d      ; "ttack!\r"
a2cc: ff                        .BYTE $ff                              ; {End of string}

a2cd: a6 00 02  StrWeakening    .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
a2d0: a5                        .BYTE $a5                              ; {Center}
a2d1: 59 6f 75 72 20            .BYTE $59,$6f,$75,$72,$20              ; "Your "
a2d6: b4 70 00 14               .BYTE $b4,$70,$00,$14                  ; {Print zts @ addr in $0070 [dat_0070_L] wid 20}
a2da: 0d                        .BYTE $0d                              ; "\r"
a2db: a5                        .BYTE $a5                              ; {Center}
a2dc: 69 73 20 77 65 61 6b 65   .BYTE $69,$73,$20,$77,$65,$61,$6b,$65  ; "is weake"
a2e4: 6e 69 6e 67 2e 0d         .BYTE $6e,$69,$6e,$67,$2e,$0d          ; "ning.\r"
a2ea: ff                        .BYTE $ff                              ; {End of string}

a2eb: a6 00 03  StrHasBroken2   .BYTE $a6,$00,$03                      ; {Col 0 Row 3}
a2ee: a5                        .BYTE $a5                              ; {Center}
a2ef: 59 6f 75 72 20            .BYTE $59,$6f,$75,$72,$20              ; "Your "
a2f4: b4 70 00 14               .BYTE $b4,$70,$00,$14                  ; {Print zts @ addr in $0070 [dat_0070_L] wid 20}
a2f8: 20 68 61 73 20 62 72 6f   .BYTE $20,$68,$61,$73,$20,$62,$72,$6f  ; " has bro"
a300: 6b 65 6e 2e 0d            .BYTE $6b,$65,$6e,$2e,$0d              ; "ken.\r"
a305: ff                        .BYTE $ff                              ; {End of string}

a306: a6 00 03  StrStunFrmBlow  .BYTE $a6,$00,$03                      ; {Col 0 Row 3}
a309: a5                        .BYTE $a5                              ; {Center}
a30a: 59 6f 75 20 61 72 65 20   .BYTE $59,$6f,$75,$20,$61,$72,$65,$20  ; "You are "
a312: 73 74 75 6e 6e 65 64 20   .BYTE $73,$74,$75,$6e,$6e,$65,$64,$20  ; "stunned "
a31a: 66 72 6f 6d 20 74 68 65   .BYTE $66,$72,$6f,$6d,$20,$74,$68,$65  ; "from the"
a322: 20 62 6c 6f 77 2e 0d      .BYTE $20,$62,$6c,$6f,$77,$2e,$0d      ; " blow.\r"
a329: ff                        .BYTE $ff                              ; {End of string}

a32a: a6 00 03  StrURKnockdDwn  .BYTE $a6,$00,$03                      ; {Col 0 Row 3}
a32d: a5                        .BYTE $a5                              ; {Center}
a32e: 59 6f 75 20 68 61 76 65   .BYTE $59,$6f,$75,$20,$68,$61,$76,$65  ; "You have"
a336: 20 62 65 65 6e 20 6b 6e   .BYTE $20,$62,$65,$65,$6e,$20,$6b,$6e  ; " been kn"
a33e: 6f 63 6b 65 64 20 64 6f   .BYTE $6f,$63,$6b,$65,$64,$20,$64,$6f  ; "ocked do"
a346: 77 6e 2e 0d               .BYTE $77,$6e,$2e,$0d                  ; "wn.\r"
a34a: ff                        .BYTE $ff                              ; {End of string}

a34b: a6 00 02  Str_a34b        .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
a34e: ac 53 76                  .BYTE $ac,$53,$76                      ; {Continue @ $7653 [StrNthFoeNmR2]}
a351: b4 7e 9f 0c               .BYTE $b4,$7e,$9f,$0c                  ; {Print zts @ addr in $9f7e [AttckDescZts_L] wid 12}
a355: 0d                        .BYTE $0d                              ; "\r"
a356: a5                        .BYTE $a5                              ; {Center}
a357: b4 db 76 0d               .BYTE $b4,$db,$76,$0d                  ; {Print zts @ addr in $76db [GenderZts_L] wid 13}
a35b: 20 77 69 74 68 20         .BYTE $20,$77,$69,$74,$68,$20          ; " with "
a361: b4 6c 00 14               .BYTE $b4,$6c,$00,$14                  ; {Print zts @ addr in $006c [FoeWpnName_L] wid 20}
a365: 0d                        .BYTE $0d                              ; "\r"
a366: a3 e5 9e                  .BYTE $a3,$e5,$9e                      ; {Call $9ee5 [sub_9ee5]}

a369: 61 74 20  ZtsAtYourHead   .BYTE $61,$74,$20                      ; "at "
a36c: 79 6f 75 72 20 68 65 61   .BYTE $79,$6f,$75,$72,$20,$68,$65,$61  ; "your hea"
a374: 64 00                     .BYTE $64,$00                          ; "d\0"

a376: 79 6f 75  ZtsYou          .BYTE $79,$6f,$75                      ; "you"
a379: 00                        .BYTE $00                              ; "\0"

a37a: 61 74 20  ZtsAtYourArm    .BYTE $61,$74,$20                      ; "at "
a37d: 79 6f 75 72 20 61 72 6d   .BYTE $79,$6f,$75,$72,$20,$61,$72,$6d  ; "your arm"
a385: 00                        .BYTE $00                              ; "\0"

a386: 61 74 20  ZtsAtYourLegs   .BYTE $61,$74,$20                      ; "at "
a389: 79 6f 75 72 20 6c 65 67   .BYTE $79,$6f,$75,$72,$20,$6c,$65,$67  ; "your leg"
a391: 73 00                     .BYTE $73,$00                          ; "s\0"

a393: 69 76 7a  AtYourDescs_L   .BYTE $69,$76,$7a    ; 4 bytes: LSB of "at your ..." Zts addresses
a396: 86                        .BYTE $86            ;

a397: a3 a3 a3  AtYourDescs_H   .BYTE $a3,$a3,$a3    ; 4 bytes: MSB of "at your ..." Zts addresses
a39a: a3                        .BYTE $a3            ;     0: $a369 [ZtsAtYourHead]
                                                     ;     1: $a376 [ZtsYou]
                                                     ;     2: $a37a [ZtsAtYourArm]
                                                     ;     3: $a386 [ZtsAtYourLegs]

a39b: 68 61 63  ZtsHacks        .BYTE $68,$61,$63                      ; "hac"
a39e: 6b 73 00                  .BYTE $6b,$73,$00                      ; "ks\0"

a3a1: 70 6f 6b  ZtsPokes        .BYTE $70,$6f,$6b                      ; "pok"
a3a4: 65 73 00                  .BYTE $65,$73,$00                      ; "es\0"

a3a7: 62 61 73  ZtsBashes       .BYTE $62,$61,$73                      ; "bas"
a3aa: 68 65 73 00               .BYTE $68,$65,$73,$00                  ; "hes\0"

a3ae: 73 70 65  ZtsSpears       .BYTE $73,$70,$65                      ; "spe"
a3b1: 61 72 73 00               .BYTE $61,$72,$73,$00                  ; "ars\0"

a3b5: 77 68 69  ZtsWhips        .BYTE $77,$68,$69                      ; "whi"
a3b8: 70 73 00                  .BYTE $70,$73,$00                      ; "ps\0"

a3bb: 7a 61 70  ZtsZaps         .BYTE $7a,$61,$70                      ; "zap"
a3be: 73 00                     .BYTE $73,$00                          ; "s\0"

a3c0: 70 75 6e  ZtsPunches      .BYTE $70,$75,$6e                      ; "pun"
a3c3: 63 68 65 73 00            .BYTE $63,$68,$65,$73,$00              ; "ches\0"

a3c8: 68 69 74  ZtsHits         .BYTE $68,$69,$74                      ; "hit"
a3cb: 73 00                     .BYTE $73,$00                          ; "s\0"

a3cd: 73 6c 61  ZtsSlashes      .BYTE $73,$6c,$61                      ; "sla"
a3d0: 73 68 65 73 00            .BYTE $73,$68,$65,$73,$00              ; "shes\0"

a3d5: 73 74 61  ZtsStabs        .BYTE $73,$74,$61                      ; "sta"
a3d8: 62 73 00                  .BYTE $62,$73,$00                      ; "bs\0"

a3db: 73 6d 61  ZtsSmashes      .BYTE $73,$6d,$61                      ; "sma"
a3de: 73 68 65 73 00            .BYTE $73,$68,$65,$73,$00              ; "shes\0"

a3e3: 69 6d 70  ZtsImpales      .BYTE $69,$6d,$70                      ; "imp"
a3e6: 61 6c 65 73 00            .BYTE $61,$6c,$65,$73,$00              ; "ales\0"

a3eb: 6c 61 73  ZtsLashes       .BYTE $6c,$61,$73                      ; "las"
a3ee: 68 65 73 00               .BYTE $68,$65,$73,$00                  ; "hes\0"

a3f2: 62 6c 61  ZtsBlasts       .BYTE $62,$6c,$61                      ; "bla"
a3f5: 73 74 73 00               .BYTE $73,$74,$73,$00                  ; "sts\0"

a3f9: 77 68 61  ZtsWhacks       .BYTE $77,$68,$61                      ; "wha"
a3fc: 63 6b 73 00               .BYTE $63,$6b,$73,$00                  ; "cks\0"

a400: 68 69 74  ZtsHits2        .BYTE $68,$69,$74                      ; "hit"
a403: 73 00                     .BYTE $73,$00                          ; "s\0"

a405: 63 6c 61  ZtsClaws        .BYTE $63,$6c,$61                      ; "cla"
a408: 77 73 00                  .BYTE $77,$73,$00                      ; "ws\0"

a40b: 6b 69 63  ZtsKicks        .BYTE $6b,$69,$63                      ; "kic"
a40e: 6b 73 00                  .BYTE $6b,$73,$00                      ; "ks\0"

a411: 62 69 74  ZtsBites        .BYTE $62,$69,$74                      ; "bit"
a414: 65 73 00                  .BYTE $65,$73,$00                      ; "es\0"

a417: 74 65 61  ZtsTears        .BYTE $74,$65,$61                      ; "tea"
a41a: 72 73 00                  .BYTE $72,$73,$00                      ; "rs\0"

a41d: 63 68 6f  ZtsChokes       .BYTE $63,$68,$6f                      ; "cho"
a420: 6b 65 73 00               .BYTE $6b,$65,$73,$00                  ; "kes\0"

a424: 6c 61 73  ZtsLashes2      .BYTE $6c,$61,$73                      ; "las"
a427: 68 65 73 00               .BYTE $68,$65,$73,$00                  ; "hes\0"

a42b: 62 75 72  ZtsBurns        .BYTE $62,$75,$72                      ; "bur"
a42e: 6e 73 00                  .BYTE $6e,$73,$00                      ; "ns\0"

a431: 73 74 69  ZtsStings       .BYTE $73,$74,$69                      ; "sti"
a434: 6e 67 73 00               .BYTE $6e,$67,$73,$00                  ; "ngs\0"

a438: 72 69 70  ZtsRips         .BYTE $72,$69,$70                      ; "rip"
a43b: 73 00                     .BYTE $73,$00                          ; "s\0"

a43d: 73 74 6f  ZtsStomps       .BYTE $73,$74,$6f                      ; "sto"
a440: 6d 70 73 00               .BYTE $6d,$70,$73,$00                  ; "mps\0"

a444: 67 6e 61  ZtsGnaws        .BYTE $67,$6e,$61                      ; "gna"
a447: 77 73 00                  .BYTE $77,$73,$00                      ; "ws\0"

a44a: 72 65 6e  ZtsRends        .BYTE $72,$65,$6e                      ; "ren"
a44d: 64 73 00                  .BYTE $64,$73,$00                      ; "ds\0"

a450: 61 73 70  ZtsAsphyxiates  .BYTE $61,$73,$70                      ; "asp"
a453: 68 79 78 69 61 74 65 73   .BYTE $68,$79,$78,$69,$61,$74,$65,$73  ; "hyxiates"
a45b: 00                        .BYTE $00                              ; "\0"

a45c: 77 61 6c  ZtsWallops      .BYTE $77,$61,$6c                      ; "wal"
a45f: 6c 6f 70 73 00            .BYTE $6c,$6f,$70,$73,$00              ; "lops\0"

a464: 66 72 69  ZtsFries        .BYTE $66,$72,$69                      ; "fri"
a467: 65 73 00                  .BYTE $65,$73,$00                      ; "es\0"

a46a: 73 74 69  ZtsStings2      .BYTE $73,$74,$69                      ; "sti"
a46d: 6e 67 73 00               .BYTE $6e,$67,$73,$00                  ; "ngs\0"

a471: 9b a1 a7  FoeAttckNms_L   .BYTE $9b,$a1,$a7                      ; 32 bytes: LSB of foe attack name Zts address
a474: ae b5 bb c0 c8 cd d5 db   .BYTE $ae,$b5,$bb,$c0,$c8,$cd,$d5,$db  ;
a47c: e3 eb f2 f9 00 05 0b 11   .BYTE $e3,$eb,$f2,$f9,$00,$05,$0b,$11  ;
a484: 17 1d 24 2b 31 38 3d 44   .BYTE $17,$1d,$24,$2b,$31,$38,$3d,$44  ;
a48c: 4a 50 5c 64 6a            .BYTE $4a,$50,$5c,$64,$6a              ;

a491: a3 a3 a3  FoeAttckNms_H   .BYTE $a3,$a3,$a3                      ; 32 bytes: MSB of foe attack name Zts address
a494: a3 a3 a3 a3 a3 a3 a3 a3   .BYTE $a3,$a3,$a3,$a3,$a3,$a3,$a3,$a3  ;      0: $a39b [ZtsHacks]
a49c: a3 a3 a3 a3 a4 a4 a4 a4   .BYTE $a3,$a3,$a3,$a3,$a4,$a4,$a4,$a4  ;      1: $a3a1 [ZtsPokes]
a4a4: a4 a4 a4 a4 a4 a4 a4 a4   .BYTE $a4,$a4,$a4,$a4,$a4,$a4,$a4,$a4  ;      2: $a3a7 [ZtsSpears]
a4ac: a4 a4 a4 a4 a4            .BYTE $a4,$a4,$a4,$a4,$a4              ;      3: $a3ae [ZtsSpears]
                                                                       ;      4: $a3b5 [ZtsWhips]
                                                                       ;      5: $a3bb [ZtsZaps]
                                                                       ;      6: $a3c0 [ZtsPunches]
                                                                       ;      7: $a3c8 [ZtsHits]
                                                                       ;      8: $a3cd [ZtsSlashes]
                                                                       ;      9: $a3d5 [ZtsStabs]
                                                                       ;     10: $a3db [ZtsSmashes]
                                                                       ;     11: $a3e3 [ZtsImpales]
                                                                       ;     12: $a3eb [ZtsLashes]
                                                                       ;     13: $a3f2 [ZtsBlasts]
                                                                       ;     14: $a3f9 [ZtsWhacks]
                                                                       ;     15: $a400 [ZtsHits2]
                                                                       ;     16: $a405 [ZtsClaws]
                                                                       ;     17: $a40b [ZtsKicks]
                                                                       ;     18: $a411 [ZtsBites]
                                                                       ;     19: $a417 [ZtsTears]
                                                                       ;     20: $a41d [ZtsChokes]
                                                                       ;     21: $a424 [ZtsLashes2]
                                                                       ;     22: $a42b [ZtsBurns]
                                                                       ;     23: $a431 [ZtsStings]
                                                                       ;     24: $a438 [ZtsRips]
                                                                       ;     25: $a43d [ZtsStomps]
                                                                       ;     26: $a444 [ZtsGnaws]
                                                                       ;     27: $a44a [ZtsRends]
                                                                       ;     28: $a450 [ZtsAsphyxiates]
                                                                       ;     29: $a45c [ZtsWallops]
                                                                       ;     30: $a464 [ZtsFries]
                                                                       ;     31: $a46a [ZtsStings2]

a4b1: a6 00 02  StrYouBlock     .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
a4b4: a5                        .BYTE $a5                              ; {Center}
a4b5: 59 6f 75 20 62 6c 6f 63   .BYTE $59,$6f,$75,$20,$62,$6c,$6f,$63  ; "You bloc"
a4bd: 6b 20 77 69 74 68 20 79   .BYTE $6b,$20,$77,$69,$74,$68,$20,$79  ; "k with y"
a4c5: 6f 75 72 0d               .BYTE $6f,$75,$72,$0d                  ; "our\r"
a4c9: a5                        .BYTE $a5                              ; {Center}
a4ca: b4 3e 9e 1e               .BYTE $b4,$3e,$9e,$1e                  ; {Print zts @ addr in $9e3e [StrYour+17] wid 30}
a4ce: 2e 0d                     .BYTE $2e,$0d                          ; ".\r"
a4d0: ff                        .BYTE $ff                              ; {End of string}

a4d1: ac 53 76  StrItFlees      .BYTE $ac,$53,$76                      ; {Continue @ $7653 [StrNthFoeNmR2]}
a4d4: 66 6c 65 65 73 21 0d      .BYTE $66,$6c,$65,$65,$73,$21,$0d      ; "flees!\r"
a4db: ff                        .BYTE $ff                              ; {End of string}

a4dc: ac 53 76  StrItFliesAway  .BYTE $ac,$53,$76                      ; {Continue @ $7653 [StrNthFoeNmR2]}
a4df: 66 6c 69 65 73 20 61 77   .BYTE $66,$6c,$69,$65,$73,$20,$61,$77  ; "flies aw"
a4e7: 61 79 21 0d               .BYTE $61,$79,$21,$0d                  ; "ay!\r"
a4eb: ff                        .BYTE $ff                              ; {End of string}

a4ec: ac 53 76  StrItLeaves     .BYTE $ac,$53,$76                      ; {Continue @ $7653 [StrNthFoeNmR2]}
a4ef: 6c 65 61 76 65 73 2e 0d   .BYTE $6c,$65,$61,$76,$65,$73,$2e,$0d  ; "leaves.\r"
a4f7: ff                        .BYTE $ff                              ; {End of string}

a4f8: 50 72 6f  ZtsProtection   .BYTE $50,$72,$6f                      ; "Pro"
a4fb: 74 65 63 74 69 6f 6e 00   .BYTE $74,$65,$63,$74,$69,$6f,$6e,$00  ; "tection\0"

a503: 53 74 72  ZtsStrength     .BYTE $53,$74,$72                      ; "Str"
a506: 65 6e 67 74 68 00         .BYTE $65,$6e,$67,$74,$68,$00          ; "ength\0"

a50c: 41 67 69  ZtsAgility      .BYTE $41,$67,$69                      ; "Agi"
a50f: 6c 69 74 79 00            .BYTE $6c,$69,$74,$79,$00              ; "lity\0"

a514: 46 69 6e  ZtsFngrOfDeath  .BYTE $46,$69,$6e                      ; "Fin"
a517: 67 65 72 20 6f 66 20 44   .BYTE $67,$65,$72,$20,$6f,$66,$20,$44  ; "ger of D"
a51f: 65 61 74 68 00            .BYTE $65,$61,$74,$68,$00              ; "eath\0"

a524: 50 61 72  ZtsParalysis    .BYTE $50,$61,$72                      ; "Par"
a527: 61 6c 79 73 69 73 00      .BYTE $61,$6c,$79,$73,$69,$73,$00      ; "alysis\0"

a52e: 46 69 72  ZtsFireball     .BYTE $46,$69,$72                      ; "Fir"
a531: 65 62 61 6c 6c 00         .BYTE $65,$62,$61,$6c,$6c,$00          ; "eball\0"

a537: 43 6f 6c  ZtsColdCone     .BYTE $43,$6f,$6c                      ; "Col"
a53a: 64 20 43 6f 6e 65 00      .BYTE $64,$20,$43,$6f,$6e,$65,$00      ; "d Cone\0"

a541: 4c 69 67  ZtsLightning    .BYTE $4c,$69,$67                      ; "Lig"
a544: 68 74 6e 69 6e 67 00      .BYTE $68,$74,$6e,$69,$6e,$67,$00      ; "htning\0"

a54b: 4d 69 6e  ZtsMindFlail    .BYTE $4d,$69,$6e                      ; "Min"
a54e: 64 20 46 6c 61 69 6c 00   .BYTE $64,$20,$46,$6c,$61,$69,$6c,$00  ; "d Flail\0"

a556: 53 75 66  ZtsSuffocation  .BYTE $53,$75,$66                      ; "Suf"
a559: 66 6f 63 61 74 69 6f 6e   .BYTE $66,$6f,$63,$61,$74,$69,$6f,$6e  ; "focation"
a561: 00                        .BYTE $00                              ; "\0"

a562: 52 65 70  ZtsRepulsion    .BYTE $52,$65,$70                      ; "Rep"
a565: 75 6c 73 69 6f 6e 00      .BYTE $75,$6c,$73,$69,$6f,$6e,$00      ; "ulsion\0"

a56c: 42 6c 69  ZtsBlink        .BYTE $42,$6c,$69                      ; "Bli"
a56f: 6e 6b 00                  .BYTE $6e,$6b,$00                      ; "nk\0"

a572: f8 03 0c  SpellNames_L    .BYTE $f8,$03,$0c                      ; 12 bytes: LSB of spell name Zts address
a575: 14 24 2e 37 41 4b 56 62   .BYTE $14,$24,$2e,$37,$41,$4b,$56,$62  ;
a57d: 6c                        .BYTE $6c                              ;

a57e: a4 a5 a5  SpellNames_H    .BYTE $a4,$a5,$a5                      ; 12 bytes: MSB of spell name Zts address
a581: a5 a5 a5 a5 a5 a5 a5 a5   .BYTE $a5,$a5,$a5,$a5,$a5,$a5,$a5,$a5  ;     0: $a4f8 [ZtsProtection]
a589: a5                        .BYTE $a5                              ;     1: $a503 [ZtsStrength]
                                                                       ;     2: $a50c [ZtsAgility]
                                                                       ;     3: $a514 [ZtsFngrOfDeath]
                                                                       ;     4: $a524 [ZtsParalysis]
                                                                       ;     5: $a52e [ZtsFireball]
                                                                       ;     6: $a537 [ZtsColdCone]
                                                                       ;     7: $a541 [ZtsLightning]
                                                                       ;     8: $a54b [ZtsMindFlail]
                                                                       ;     9: $a556 [ZtsSuffocation]
                                                                       ;    10: $a562 [ZtsRepulsion]
                                                                       ;    11: $a56c [ZtsBlink]

a58a: a6 00 02  StrYouTheSpell  .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
a58d: a3 fc 9e                  .BYTE $a3,$fc,$9e                      ; {Call $9efc [disableNumPad]}
a590: a5                        .BYTE $a5                              ; {Center}
a591: 59 6f 75 20               .BYTE $59,$6f,$75,$20                  ; "You "
a595: b4 d9 76 28               .BYTE $b4,$d9,$76,$28                  ; {Print zts @ addr in $76d9 [GrbItemName_L] wid 40}
a599: 20 74 68 65 20 73 70 65   .BYTE $20,$74,$68,$65,$20,$73,$70,$65  ; " the spe"
a5a1: 6c 6c 0d                  .BYTE $6c,$6c,$0d                      ; "ll\r"
a5a4: a5                        .BYTE $a5                              ; {Center}
a5a5: 61 6e 64 20 61 72 65 20   .BYTE $61,$6e,$64,$20,$61,$72,$65,$20  ; "and are "
a5ad: 68 69 74 20 66 6f 72 20   .BYTE $68,$69,$74,$20,$66,$6f,$72,$20  ; "hit for "
a5b5: b1 a7 00 06               .BYTE $b1,$a7,$00,$06                  ; {Print uint16 @ $00a7 [dat_00a7_H] wid 6}
a5b9: 2e 0d                     .BYTE $2e,$0d                          ; ".\r"
a5bb: a3 02 9f                  .BYTE $a3,$02,$9f                      ; {Call $9f02 [enableNumPad]}
a5be: ff                        .BYTE $ff                              ; {End of string}

a5bf: 72 65 70  ZtsRepel        .BYTE $72,$65,$70                      ; "rep"
a5c2: 65 6c 00                  .BYTE $65,$6c,$00                      ; "el\0"

a5c5: 72 65 73  ZtsResist       .BYTE $72,$65,$73                      ; "res"
a5c8: 69 73 74 00               .BYTE $69,$73,$74,$00                  ; "ist\0"

a5cc: 66 61 69  ZtsFail2Resist  .BYTE $66,$61,$69                      ; "fai"
a5cf: 6c 20 74 6f 20 72 65 73   .BYTE $6c,$20,$74,$6f,$20,$72,$65,$73  ; "l to res"
a5d7: 69 73 74 00               .BYTE $69,$73,$74,$00                  ; "ist\0"

a5db: bf c5 cc  ResistDesc_L    .BYTE $bf,$c5,$cc    ; 3 bytes: LSB of spell resistance description Zts address
a5de: a5 a5 a5  ResistDesc_H    .BYTE $a5,$a5,$a5    ; 3 bytes: MSB of spell resistance description Zts address
                                                     ;    0: $a5bf [ZtsRepel]
                                                     ;    1: $a5c5 [ZtsResist]
                                                     ;    2: $a5cc [ZtsFail2Resist]

a5e1: a6 00 03  StrHrldFrmGrsp  .BYTE $a6,$00,$03                      ; {Col 0 Row 3}
a5e4: a5                        .BYTE $a5                              ; {Center}
a5e5: 59 6f 75 72 20            .BYTE $59,$6f,$75,$72,$20              ; "Your "
a5ea: b4 3c 9e 19               .BYTE $b4,$3c,$9e,$19                  ; {Print zts @ addr in $9e3c [StrYour+15] wid 25}
a5ee: 20 69 73 20 68 75 72 6c   .BYTE $20,$69,$73,$20,$68,$75,$72,$6c  ; " is hurl"
a5f6: 65 64 0d                  .BYTE $65,$64,$0d                      ; "ed\r"
a5f9: a5                        .BYTE $a5                              ; {Center}
a5fa: 66 72 6f 6d 20 79 6f 75   .BYTE $66,$72,$6f,$6d,$20,$79,$6f,$75  ; "from you"
a602: 72 20 67 72 61 73 70 21   .BYTE $72,$20,$67,$72,$61,$73,$70,$21  ; "r grasp!"
a60a: 0d                        .BYTE $0d                              ; "\r"
a60b: ff                        .BYTE $ff                              ; {End of string}

a60c: a6 00 03  StrItsPower     .BYTE $a6,$00,$03                      ; {Col 0 Row 3}
a60f: a5                        .BYTE $a5                              ; {Center}
a610: 59 6f 75 20               .BYTE $59,$6f,$75,$20                  ; "You "
a614: b4 d9 76 28               .BYTE $b4,$d9,$76,$28                  ; {Print zts @ addr in $76d9 [GrbItemName_L] wid 40}
a618: 20 69 74 73 20 70 6f 77   .BYTE $20,$69,$74,$73,$20,$70,$6f,$77  ; " its pow"
a620: 65 72 2e 0d               .BYTE $65,$72,$2e,$0d                  ; "er.\r"
a624: ff                        .BYTE $ff                              ; {End of string}

a625: a3 59 a6  StrYouEncnter2  .BYTE $a3,$59,$a6                      ; {Call $a659 [setFoeName]}
a628: a3 a8 a6                  .BYTE $a3,$a8,$a6                      ; {Call $a6a8 [setFactionName]}
a62b: a6 00 02                  .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
a62e: a5                        .BYTE $a5                              ; {Center}
a62f: 59 6f 75 20 65 6e 63 6f   .BYTE $59,$6f,$75,$20,$65,$6e,$63,$6f  ; "You enco"
a637: 75 6e 74 65 72 20         .BYTE $75,$6e,$74,$65,$72,$20          ; "unter "
a63d: b2 00 aa 01               .BYTE $b2,$00,$aa,$01                  ; {Print uint8 @ $aa00 [FoeCount] wid 1}
a641: 20                        .BYTE $20                              ; " "
a642: b4 d9 76 14               .BYTE $b4,$d9,$76,$14                  ; {Print zts @ addr in $76d9 [GrbItemName_L] wid 20}
a646: 0d                        .BYTE $0d                              ; "\r"
a647: a5                        .BYTE $a5                              ; {Center}
a648: 6f 66 20                  .BYTE $6f,$66,$20                      ; "of "
a64b: b4 dd 76 19               .BYTE $b4,$dd,$76,$19                  ; {Print zts @ addr in $76dd [FactionNmZts_L] wid 25}
a64f: 2e 0d 0d                  .BYTE $2e,$0d,$0d                      ; ".\r\r"
a652: a5                        .BYTE $a5                              ; {Center}
a653: b4 db 76 28               .BYTE $b4,$db,$76,$28                  ; {Print zts @ addr in $76db [GenderZts_L] wid 40}
a657: 0d                        .BYTE $0d                              ; "\r"
a658: ff                        .BYTE $ff                              ; {End of string}

                ; Sets GrbItemName_L/H to either FoeNameZts_L/H or FoeNameZts2_L/H
                ;
                ; Input
                ;   FoeCount        - Determines which value to assign
                ;   FoeNameZts_L/H  - Assigned if FoeCount is != 1
                ;   FoeNameZts2_L/H - Assigned if FoeCount is == 1
                ;
                ; Output
                ;   GrbItemName_L/H - Assigned FoeNameZts_L/H when FoeCount is != 1 otherwise assigned FoeNameZts2_L/H
                ;
a659: ad 01 aa  setFoeName      LDA FoeNameZts_L     ; Set
a65c: 8d d9 76                  STA GrbItemName_L    ;     GrbItemName_L/H
a65f: ad 02 aa                  LDA FoeNameZts_H     ;     to
a662: 8d da 76                  STA GrbItemName_H    ;     FoeNameZts_L/H
a665: ad 00 aa                  LDA FoeCount         ; If
a668: c9 01                     CMP #$01             ;    (FoeCount == 1)
a66a: f0 0c                     BEQ loc_a678         ; Then
a66c: ad 03 aa                  LDA FoeNameZts2_L    ;     Set
a66f: 8d d9 76                  STA GrbItemName_L    ;         GrbItemName_L/H
a672: ad 04 aa                  LDA FoeNameZts2_H    ;         to
a675: 8d da 76                  STA GrbItemName_H    ;         FoeNameZts2_L/H
                                                     ; End If
a678: 60        loc_a678        RTS                  ; Return to caller

a679: 22 44 69  ZtsDieOutcast   .BYTE $22,$44,$69                      ; ""Di"
a67c: 65 2c 20 6f 75 74 63 61   .BYTE $65,$2c,$20,$6f,$75,$74,$63,$61  ; "e, outca"
a684: 73 74 21 22 00            .BYTE $73,$74,$21,$22,$00              ; "st!"\0"

a689: 22 48 61  ZtsHailFriend   .BYTE $22,$48,$61                      ; ""Ha"
a68c: 69 6c 20 66 72 69 65 6e   .BYTE $69,$6c,$20,$66,$72,$69,$65,$6e  ; "il frien"
a694: 64 21 22 00               .BYTE $64,$21,$22,$00                  ; "d!"\0"

a698: 22 42 65  ZtsBegoneOffl   .BYTE $22,$42,$65                      ; ""Be"
a69b: 67 6f 6e 65 20 6f 66 66   .BYTE $67,$6f,$6e,$65,$20,$6f,$66,$66  ; "gone off"
a6a3: 61 6c 21 22 00            .BYTE $61,$6c,$21,$22,$00              ; "al!"\0"

                ; Sets FactionNmZts_L/H to the faction name from FactionNames_L/H with index FactionNum.
                ;
                ; Input
                ;   FactionNum  - The faction index (0..31)
                ;
                ; Output
                ;   FactionNmZts_L/H - Set to FactionNames_L/H[FactionNum]
                ;
a6a8: a6 a6     setFactionName  LDX FactionNum       ; Set X = FactionNum
a6aa: bd 2b 9a                  LDA FactionNames_L,X ; Set
a6ad: 8d dd 76                  STA FactionNmZts_L   ;     FactionNmZts_L/H
a6b0: bd 3b 9a                  LDA FactionNames_H,X ;     to
a6b3: 8d de 76                  STA FactionNmZts_H   ;     FactionNames_L/H[X]
a6b6: 60                        RTS                  ; Return to caller

a6b7: a3 f1 a6  StrDiskPrompt   .BYTE $a3,$f1,$a6                      ; {Call $a6f1 [setDiskPrompt]}
a6ba: a6 00 03                  .BYTE $a6,$00,$03                      ; {Col 0 Row 3}
a6bd: a5                        .BYTE $a5                              ; {Center}
a6be: b4 d9 76 27               .BYTE $b4,$d9,$76,$27                  ; {Print zts @ addr in $76d9 [GrbItemName_L] wid 39}
a6c2: 0d                        .BYTE $0d                              ; "\r"
a6c3: ff                        .BYTE $ff                              ; {End of string}

a6c4: 43 68 65  ZtsCheckDisk    .BYTE $43,$68,$65                      ; "Che"
a6c7: 63 6b 20 64 69 73 6b 20   .BYTE $63,$6b,$20,$64,$69,$73,$6b,$20  ; "ck disk "
a6cf: 69 6e 20 64 72 69 76 65   .BYTE $69,$6e,$20,$64,$72,$69,$76,$65  ; "in drive"
a6d7: 20 20 2e 00               .BYTE $20,$20,$2e,$00                  ; "  .\0"

a6db: 49 6e 73  ZtsInsertD3S1   .BYTE $49,$6e,$73                      ; "Ins"
a6de: 65 72 74 20 44 69 73 6b   .BYTE $65,$72,$74,$20,$44,$69,$73,$6b  ; "ert Disk"
a6e6: 20 33 20 53 69 64 65 20   .BYTE $20,$33,$20,$53,$69,$64,$65,$20  ; " 3 Side "
a6ee: 31 2e 00                  .BYTE $31,$2e,$00                      ; "1.\0"

                ; Sets GrbItemName_L/H to either ZtsInsertD3S1 or ZtsCheckDisk depending on amount of system memory.
                ;
                ; Input
                ;   SysMemorySize - 0 (48KB), $80 (64KB) or $c0 (128KB+)
                ;
                ; Output
                ;   GrbItemName_L/H - Set to ZtsInsertD3S1 when bit 6 of SysMemorySize is set (128KB+),
                ;                     otherwise set to ZtsCheckDisk.
                ;
a6f1: a9 db     setDiskPrompt   LDA #$db             ; Set
a6f3: 8d d9 76                  STA GrbItemName_L    ;     GrbItemName_L/H
a6f6: a9 a6                     LDA #$a6             ;     to
a6f8: 8d da 76                  STA GrbItemName_H    ;     $a6db [ZtsInsertD3S1]
a6fb: 2c 58 02                  BIT SysMemorySize    ; If ((SysMemorySize & $40) == 0)
a6fe: 70 15                     BVS loc_a715         ; Then
a700: a9 c4                     LDA #$c4             ;     Set
a702: 8d d9 76                  STA GrbItemName_L    ;         GrbItemName_L/H
a705: a9 a6                     LDA #$a6             ;         to
a707: 8d da 76                  STA GrbItemName_H    ;         $a6c4 [ZtsCheckDisk]
a70a: 38                        SEC                  ;     Set C = 1
a70b: ad 30 02                  LDA DriveId          ;     Set
a70e: e9 30                     SBC #$30             ;         ZtsCheckDisk[20]
a710: 09 30                     ORA #$30             ;            =
a712: 8d d8 a6                  STA ZtsCheckDisk+20  ;              (DriveId - $30) | $30
                                                     ; End If
a715: 60        loc_a715        RTS                  ; Return to caller

a716: a6 00 03  StrNotEscape    .BYTE $a6,$00,$03                      ; {Col 0 Row 3}
a719: a5                        .BYTE $a5                              ; {Center}
a71a: 59 6f 75 20               .BYTE $59,$6f,$75,$20                  ; "You "
a71e: b4 d9 76 08               .BYTE $b4,$d9,$76,$08                  ; {Print zts @ addr in $76d9 [GrbItemName_L] wid 8}
a722: 20 65 73 63 61 70 65 2e   .BYTE $20,$65,$73,$63,$61,$70,$65,$2e  ; " escape."
a72a: 0d                        .BYTE $0d                              ; "\r"
a72b: ff                        .BYTE $ff                              ; {End of string}

a72c: 64 69 64  ZtsDidnt        .BYTE $64,$69,$64      ; "did"
a72f: 6e 27 74 00               .BYTE $6e,$27,$74,$00  ; "n't\0"

a733: 63 61 6e  ZtsCant         .BYTE $63,$61,$6e      ; "can"
a736: 27 74 00                  .BYTE $27,$74,$00      ; "'t\0"

a739: ac 65 76  StrNotIntrstd   .BYTE $ac,$65,$76                      ; {Continue @ $7665 [StrNthFoeNmR3]}
a73c: 73 65 65 6d 73 20 75 6e   .BYTE $73,$65,$65,$6d,$73,$20,$75,$6e  ; "seems un"
a744: 69 6e 74 65 72 65 73 74   .BYTE $69,$6e,$74,$65,$72,$65,$73,$74  ; "interest"
a74c: 65 64 2e 0d               .BYTE $65,$64,$2e,$0d                  ; "ed.\r"
a750: ff                        .BYTE $ff                              ; {End of string}

a751: ac 65 76  StrMumbles      .BYTE $ac,$65,$76                      ; {Continue @ $7665 [StrNthFoeNmR3]}
a754: 6d 75 6d 62 6c 65 73 0d   .BYTE $6d,$75,$6d,$62,$6c,$65,$73,$0d  ; "mumbles\r"
a75c: a5                        .BYTE $a5                              ; {Center}
a75d: 73 6f 6d 65 74 68 69 6e   .BYTE $73,$6f,$6d,$65,$74,$68,$69,$6e  ; "somethin"
a765: 67 20 75 6e 69 6e 74 65   .BYTE $67,$20,$75,$6e,$69,$6e,$74,$65  ; "g uninte"
a76d: 6c 6c 69 67 69 62 6c 65   .BYTE $6c,$6c,$69,$67,$69,$62,$6c,$65  ; "lligible"
a775: 2e 0d                     .BYTE $2e,$0d                          ; ".\r"
a777: ff                        .BYTE $ff                              ; {End of string}

a778: a6 00 03  StrPearCheese   .BYTE $a6,$00,$03                      ; {Col 0 Row 3}
a77b: a5                        .BYTE $a5                              ; {Center}
a77c: 22 44 6f 6e 27 74 20 74   .BYTE $22,$44,$6f,$6e,$27,$74,$20,$74  ; ""Don't t"
a784: 65 6c 6c 20 74 68 65 20   .BYTE $65,$6c,$6c,$20,$74,$68,$65,$20  ; "ell the "
a78c: 70 65 61 73 61 6e 74 73   .BYTE $70,$65,$61,$73,$61,$6e,$74,$73  ; "peasants"
a794: 20 68 6f 77 20 67 6f 6f   .BYTE $20,$68,$6f,$77,$20,$67,$6f,$6f  ; " how goo"
a79c: 64 0d                     .BYTE $64,$0d                          ; "d\r"
a79e: a5                        .BYTE $a5                              ; {Center}
a79f: 74 68 65 20 70 65 61 72   .BYTE $74,$68,$65,$20,$70,$65,$61,$72  ; "the pear"
a7a7: 73 20 61 72 65 20 77 69   .BYTE $73,$20,$61,$72,$65,$20,$77,$69  ; "s are wi"
a7af: 74 68 20 74 68 65 20 63   .BYTE $74,$68,$20,$74,$68,$65,$20,$63  ; "th the c"
a7b7: 68 65 65 73 65 21 22 0d   .BYTE $68,$65,$65,$73,$65,$21,$22,$0d  ; "heese!"\r"
a7bf: ff                        .BYTE $ff                              ; {End of string}

a7c0: a6 00 03  StrDevourer     .BYTE $a6,$00,$03                      ; {Col 0 Row 3}
a7c3: a5                        .BYTE $a5                              ; {Center}
a7c4: 22 52 75 6e 21 20 54 68   .BYTE $22,$52,$75,$6e,$21,$20,$54,$68  ; ""Run! Th"
a7cc: 65 20 44 65 76 6f 75 72   .BYTE $65,$20,$44,$65,$76,$6f,$75,$72  ; "e Devour"
a7d4: 65 72 20 63 6f 6d 65 73   .BYTE $65,$72,$20,$63,$6f,$6d,$65,$73  ; "er comes"
a7dc: 21 22 0d                  .BYTE $21,$22,$0d                      ; "!"\r"
a7df: ff                        .BYTE $ff                              ; {End of string}

a7e0: a6 00 03  StrNoGoodDeed   .BYTE $a6,$00,$03                      ; {Col 0 Row 3}
a7e3: a3 09 a8                  .BYTE $a3,$09,$a8                      ; {Call $a809 [setRwrdOrPnshd]}
a7e6: a5                        .BYTE $a5                              ; {Center}
a7e7: 22 4e 6f 20 67 6f 6f 64   .BYTE $22,$4e,$6f,$20,$67,$6f,$6f,$64  ; ""No good"
a7ef: 20 64 65 65 64 20 65 76   .BYTE $20,$64,$65,$65,$64,$20,$65,$76  ; " deed ev"
a7f7: 65 72 20 67 6f 65 73 20   .BYTE $65,$72,$20,$67,$6f,$65,$73,$20  ; "er goes "
a7ff: 75 6e                     .BYTE $75,$6e                          ; "un"
a801: b4 d9 76 0a               .BYTE $b4,$d9,$76,$0a                  ; {Print zts @ addr in $76d9 [GrbItemName_L] wid 10}
a805: 2e 22 0d                  .BYTE $2e,$22,$0d                      ; "."\r"
a808: ff                        .BYTE $ff                              ; {End of string}

                ; Sets GrbItemName_L/H to ZtsRewarded if FoeAlign < 0 and ZtsPunished otherwise.
                ;
                ; Input
                ;   FoeAlign
                ;
                ; Output
                ;   GrbItemName_L/H - Set to ZtsRewarded if FoeAlign < 0 otherwise set to ZtsPunished.
                ;
a809: a9 23     setRwrdOrPnshd  LDA #$23             ; Set
a80b: 8d d9 76                  STA GrbItemName_L    ;     GrbItemName_L/H
a80e: a9 a8                     LDA #$a8             ;     to
a810: 8d da 76                  STA GrbItemName_H    ;     $a823 [ZtsRewarded]
a813: ad 0c aa                  LDA FoeAlign         ; If (FoeAlign >= 0)
a816: 30 0a                     BMI loc_a822         ; Then
a818: a9 2c                     LDA #$2c             ;     Set
a81a: 8d d9 76                  STA GrbItemName_L    ;         GrbItemName_L/H
a81d: a9 a8                     LDA #$a8             ;         to
a81f: 8d da 76                  STA GrbItemName_H    ;         $a82c [ZtsPunished]
                                                     ; End If
a822: 60        loc_a822        RTS                  ; Return to caller

a823: 72 65 77  ZtsRewarded     .BYTE $72,$65,$77              ; "rew"
a826: 61 72 64 65 64 00         .BYTE $61,$72,$64,$65,$64,$00  ; "arded\0"

a82c: 70 75 6e  ZtsPunished     .BYTE $70,$75,$6e              ; "pun"
a82f: 69 73 68 65 64 00         .BYTE $69,$73,$68,$65,$64,$00  ; "ished\0"

a835: a6 00 03  StrApclypsSoon  .BYTE $a6,$00,$03                      ; {Col 0 Row 3}
a838: a5                        .BYTE $a5                              ; {Center}
a839: 22 50 72 65 70 61 72 65   .BYTE $22,$50,$72,$65,$70,$61,$72,$65  ; ""Prepare"
a841: 2c 20 74 68 65 20 41 70   .BYTE $2c,$20,$74,$68,$65,$20,$41,$70  ; ", the Ap"
a849: 6f 63 61 6c 79 70 73 65   .BYTE $6f,$63,$61,$6c,$79,$70,$73,$65  ; "ocalypse"
a851: 20 69 73 20 73 6f 6f 6e   .BYTE $20,$69,$73,$20,$73,$6f,$6f,$6e  ; " is soon"
a859: 2e 22 0d                  .BYTE $2e,$22,$0d                      ; "."\r"
a85c: ff                        .BYTE $ff                              ; {End of string}

a85d: a6 00 03  StrFalseAlarms  .BYTE $a6,$00,$03                      ; {Col 0 Row 3}
a860: a5                        .BYTE $a5                              ; {Center}
a861: 22 42 65 77 61 72 65 20   .BYTE $22,$42,$65,$77,$61,$72,$65,$20  ; ""Beware "
a869: 6f 66 20 66 61 6c 73 65   .BYTE $6f,$66,$20,$66,$61,$6c,$73,$65  ; "of false"
a871: 20 61 6c 61 72 6d 73 2e   .BYTE $20,$61,$6c,$61,$72,$6d,$73,$2e  ; " alarms."
a879: 22 0d                     .BYTE $22,$0d                          ; ""\r"
a87b: ff                        .BYTE $ff                              ; {End of string}

a87c: 51 78 c0  HailRspnses_L   .BYTE $51,$78,$c0      ; 6 bytes: LSB of hail response string address
a87f: e0 35 5d                  .BYTE $e0,$35,$5d      ;

a882: a7 a7 a7  HailRspnses_H   .BYTE $a7,$a7,$a7      ; 6 bytes: MSB of hail response string address
a885: a7 a8 a8                  .BYTE $a7,$a8,$a8      ;     0: $a751 [StrMumbles]      3: $a7e0 [StrNoGoodDeed]
                                                       ;     1: $a778 [StrPearCheese]   4: $a835 [StrApclypsSoon]
                                                       ;     2: $a7c0 [StrDevourer]     5: $a85d [StrFalseAlarms]

a888: 63 6f 72  ZtsCorpse       .BYTE $63,$6f,$72      ; "cor"
a88b: 70 73 65 00               .BYTE $70,$73,$65,$00  ; "pse\0"

a88f: 0b 0e 08  tbl_a88f        .BYTE $0b,$0e,$08    ;

a892: 00        ModuleStatusPg  .BYTE $00            ; The number of the status page added when the module was
                                                     ;     initialized

a893: 00        dat_a893        .BYTE $00            ;

a894: 00        dat_a894        .BYTE $00            ;

a88f: 0b 0e 08  tbl_a88f        .BYTE $0b,$0e,$08    ; ...
a892: 00        ModuleStatusPg  .BYTE $00            ; .
a893: 00        dat_a893        .BYTE $00            ; .
a894: 00        dat_a894        .BYTE $00            ; .
a895: 00        dat_a895        .BYTE $00            ; .
a896: 00        TmpRollDiceX    .BYTE $00            ; rollDiceA: Temp storage used to ensure X is unchanged on RTS
                                                     ; rollDice: Assigned to X before returning to caller
a897: 00        TmpRollDiceY    .BYTE $00            ; rollDiceA: Temp storage used to ensure Y is unchanged on RTS
                                                     ; rollDice: Assigned to Y before returning to caller
a898: 00                        BRK                  ; .
a899: 00                        BRK                  ; .
a89a: 00                        BRK                  ; .
a89b: 00                        BRK                  ; .
a89c: 00        dat_a89c        .BYTE $00            ; .
a89d: 00        dat_a89d        .BYTE $00            ; .
a89e: 00        dat_a89e        .BYTE $00            ; .
a89f: 00        dat_a89f        .BYTE $00            ; .
a8a0: 00        dat_a8a0        .BYTE $00            ; .
a8a1: dc 02                     .BYTE $dc,$02        ; ..
a8a3: ec 01 ea  loc_a8a3        CPX TEX_Copy+3585    ; ...
a8a6: 01 ee                     ORA (NSIGN,X)        ; ..
a8a8: 01 ee                     ORA (NSIGN,X)        ; ..
a8aa: 01 ea                     ORA (FR2+4,X)        ; ..
a8ac: 01 ee                     ORA (NSIGN,X)        ; ..
a8ae: 01 ea     loc_a8ae        ORA (FR2+4,X)        ; ..
a8b0: 01 ea                     ORA (FR2+4,X)        ; ..
a8b2: 01 e2                     ORA (FR1+2,X)        ; ..
a8b4: 02                        .BYTE $02            ; .
a8b5: e0 02                     CPX #$02             ; ..
a8b7: ea                        NOP                  ; .
a8b8: 01 f8                     ORA (ZTEMP2+1,X)     ; ..
a8ba: 00                        BRK                  ; .
a8bb: ea                        NOP                  ; .
a8bc: 01 c0                     ORA ($c0,X)          ; ..
a8be: 04                        .BYTE $04            ; .
a8bf: f8                        SED                  ; .
a8c0: 00                        BRK                  ; .
a8c1: e0 02                     CPX #$02             ; ..
a8c3: f8                        SED                  ; .
a8c4: 00                        BRK                  ; .
a8c5: e2 02                     .BYTE $e2,$02        ; ..
a8c7: ce 03 06                  DEC DISPL_ARWS_L6+4  ; ...
a8ca: 02                        .BYTE $02            ; .
a8cb: 06 02                     ASL UInt16Val_L      ; ..
a8cd: ee 01 d2                  INC AUDC1            ; ...
a8d0: 03                        .BYTE $03            ; .
a8d1: ea                        NOP                  ; .
a8d2: 01 ce                     ORA ($ce,X)          ; ..
a8d4: 03 e2 02                  .BYTE $03,$e2,$02    ; ...
a8d7: 0a                        ASL                  ; .
a8d8: 01 d2                     ORA ($d2,X)          ; ..
a8da: 03                        .BYTE $03            ; .
a8db: ea                        NOP                  ; .
a8dc: 01 ea                     ORA (FR2+4,X)        ; ..
a8de: 01 ea                     ORA (FR2+4,X)        ; ..
a8e0: 01 b2                     ORA ($b2,X)          ; ..
a8e2: 05 ee                     ORA NSIGN            ; ..
a8e4: 01 ea                     ORA (FR2+4,X)        ; ..
a8e6: 01 f8                     ORA (ZTEMP2+1,X)     ; ..
a8e8: 00                        BRK                  ; .
a8e9: dc 02                     .BYTE $dc,$02        ; ..
a8eb: ea                        NOP                  ; .
a8ec: 01 ea                     ORA (FR2+4,X)        ; ..
a8ee: 01 ea                     ORA (FR2+4,X)        ; ..
a8f0: 01 ce                     ORA ($ce,X)          ; ..
a8f2: 03                        .BYTE $03            ; .
a8f3: ea                        NOP                  ; .
a8f4: 01 ee                     ORA (NSIGN,X)        ; ..
a8f6: 01 f8                     ORA (ZTEMP2+1,X)     ; ..
a8f8: 00                        BRK                  ; .

                ;
                ;
                ;
a8f9: a0 02     sub_a8f9        LDY #$02             ; Set Y = 2
a8fb: a9 10                     LDA #$10             ; Set
a8fd: 91 62                     STA (dat_0062),Y     ;     (*dat_0062)[2] = $10 (16)
a8ff: a2 8f                     LDX #$8f             ; Set
a901: a0 fb                     LDY #$fb             ;     FoeWpnName_L/H
a903: 86 6d                     STX FoeWpnName_H     ;     to
a905: 84 6c                     STY FoeWpnName_L     ;     $8ffb []
a907: 4c b0 81                  JMP loc_81b0         ; Continue @ $81b0 [loc_81b0]

a90a: 60        loc_a90a        RTS                  ;

                ;
                ;
                ;
a90b: a9 7d     sub_a90b        LDA #$7d             ; .}
a90d: 85 16                     STA StrTmplate_L     ; ..
a90f: a9 86                     LDA #$86             ; ..
a911: 85 17                     STA StrTmplate_H     ; ..
a913: a6 66                     LDX dat_0066_L       ; .f
a915: 20 51 18                  JSR j_setStatPgStr2  ;  Q.
a918: a6 66                     LDX dat_0066_L       ; .f
a91a: 8e 33 19                  STX CurStatusPage    ; .3.
a91d: 20 48 18                  JSR j_dispStatusPg   ;  H.
a920: 68                        PLA                  ; h
a921: 68                        PLA                  ; h
a922: a9 78                     LDA #$78             ; .x
a924: 85 69                     STA FoeWpnAddr_H     ; .i
a926: a9 31                     LDA #$31             ; .1
a928: 85 68                     STA FoeWpnAddr_L     ; .h
a92a: 4c 7a 78                  JMP loc_787a         ; Lzx

a92d: 4c 36 7d  loc_a92d        JMP loc_7d36         ;      TODO: This seems to jump into data... Bogus code?
a930: a6 67                     LDX dat_0066_H       ;
a932: bd c2 63                  LDA FactionRepute,X  ;
a935: 10 d4                     BPL sub_a90b         ;
a937: 20 16 79                  JSR sub_7916         ;
a93a: d0 f1                     BNE loc_a92d         ;
a93c: a0 00                     LDY #$00             ;
a93e: b1 62                     LDA (dat_0062),Y     ;
a940: 10 eb                     BPL loc_a92d         ;
a942: a0 02                     LDY #$02             ;
a944: a9 63                     LDA #$63             ;
a946: 38                        SEC                  ;
a947: f1 64                     SBC (dat_0064_L),Y   ;
a949: d0 07                     BNE loc_a952         ;
a94b: a2 84                     LDX #$84             ;
a94d: a0 ed                     LDY #$ed             ;
a94f: 4c fc 78                  JMP loc_78fc         ;
a952: 85 87     loc_a952        STA DiceCount        ;
a954: a9 d8                     LDA #$d8             ;
a956: 85 16                     STA StrTmplate_L     ;
a958: a9 86                     LDA #$86             ;
a95a: 85 17                     STA StrTmplate_H     ;
a95c: a9 00                     LDA #$00             ;
a95e: 85 86                     STA dat_0086         ;
a960: a6 66                     LDX dat_0066_L       ;
a962: 20 51 18                  JSR j_setStatPgStr2  ;
a965: 20 ae 18                  JSR j_readBEUInt16   ;
a968: a5 02                     LDA UInt16Val_L      ;
a96a: 05 03                     ORA UInt16Val_H      ;
a96c: f0 9c                     BEQ loc_a90a         ;
a96e: a5 03                     LDA UInt16Val_H      ;
a970: f0 04                     BEQ loc_a976         ;
a972: a9 ff                     LDA #$ff             ;
a974: 85 02                     STA UInt16Val_L      ;
a976: a5 87     loc_a976        LDA DiceCount        ;
a978: c5 02                     CMP UInt16Val_L      ;
a97a: b0 02                     BCS loc_a97e         ;
a97c: 85 02                     STA UInt16Val_L      ;
a97e: a9 00     loc_a97e        LDA #$00             ;
a980: 85 79                     STA dat_0079         ;
a982: a5 02                     LDA UInt16Val_L      ;
a984: 85 71                     STA dat_0070_H       ;
a986: 85 7a                     STA DiceRoll_L       ;
a988: a2 00                     LDX #$00             ;
a98a: c9 01                     CMP #$01             ;
a98c: f0 02                     BEQ loc_a990         ;
a98e: a2 73                     LDX #$73             ;
a990: 8e da 90  loc_a990        STX ModuleStart+6874 ;
a993: a9 ff                     LDA #$ff             ;
a995: 85 16                     STA StrTmplate_L     ;
a997: a9 85                     LDA #$85             ;
a999: 85 17                     STA StrTmplate_H     ;
a99b: a6 66                     LDX dat_0066_L       ;
a99d: 20 51 18                  JSR j_setStatPgStr2  ;
a9a0: a6 66     loc_a9a0        LDX dat_0066_L       ;
a9a2: 8e 33 19                  STX CurStatusPage    ;
a9a5: 20 48 18                  JSR j_dispStatusPg   ;
a9a8: a9 37     loc_a9a8        LDA #$37             ;
a9aa: 8d 77 19                  STA cont_addr_1977_L ;
a9ad: a9 7e                     LDA #$7e             ;
a9af: 8d 78 19                  STA cont_addr_1977_H ;
a9b2: 4c 06 18                  JMP j_sub_2ff3       ;
a9b5: 60        loc_a9b5        RTS                  ; Return to caller

a9b6: a5 31                     LDA KbdChar          ; .1
a9b8: 30 ee                     BMI loc_a9a8         ; 0.
a9ba: 20 3f 18                  JSR j_charToUpper    ;  ?.
a9bd: c9 4e                     CMP #$4e             ; .N
a9bf: f0 f4                     BEQ loc_a9b5         ; ..
a9c1: c9 59                     CMP #$59             ; .Y
a9c3: d0 db                     BNE loc_a9a0         ; ..
a9c5: a5 79                     LDA dat_0079         ; .y
a9c7: 85 03                     STA UInt16Val_H      ;
a9c9: a5 7a                     LDA DiceRoll_L       ; .z
a9cb: 85 02                     STA UInt16Val_L      ; ..
a9cd: 20 17 7b                  JSR sub_7b17         ;  .{
a9d0: 90 03                     BCC loc_a9d5         ; ..
a9d2: 4c 6e 7d                  JMP loc_7d6e         ; Ln}
a9d5: 20 16 79  loc_a9d5        JSR sub_7916         ;  .y
a9d8: a0 02                     LDY #$02             ; ..
a9da: a5 71                     LDA dat_0070_H       ; .q
a9dc: 18                        CLC                  ; .
a9dd: 71 64                     ADC (dat_0064_L),Y   ; qd
a9df: 91 64                     STA (dat_0064_L),Y   ; .d
a9e1: a2 00                     LDX #$00             ; ..
a9e3: 38                        SEC                  ; 8
a9e4: e9 0a     loc_a9e4        SBC #$0a             ; ..
a9e6: 90 03                     BCC loc_a9eb         ; ..
a9e8: e8                        INX                  ; .
a9e9: d0 f9                     BNE loc_a9e4         ; ..
a9eb: 69 0a     loc_a9eb        ADC #$0a             ; i.
a9ed: 86 79                     STX dat_0079         ; .y
a9ef: 09 30                     ORA #$30             ; .0
a9f1: 85 72                     STA dat_0072         ; .r
a9f3: a0 05                     LDY #$05             ; ..
a9f5: b1 62                     LDA (dat_0062),Y     ; .b
a9f7: 38                        SEC                  ; 8
a9f8: e9 03                     SBC #$03             ; ..
a9fa: a8                        TAY                  ; .
a9fb: a5 72                     LDA dat_0072         ; .r
a9fd: 91 62                     STA (dat_0062),Y     ; .b
a9ff: 88                        DEY                  ; .

                ;
                ; Note: This sub is called once after the module is loaded and then the space is used for data.
                ;       It would appear that the foe's/opponent's data is loaded here.
                ;

aa00: a9 ff     sub_aa00        LDA #$ff             ; Set
aa02: 85 a6                     STA FactionNum       ;     FactionNum = $ff
aa04: 85 af                     STA dat_00af         ; Set dat_00af = $ff
aa06: ad 59 19                  LDA MapLocSpclType   ; If (MapLocSpclType == 0)                          (0 = encounter)
aa09: d0 0e                     BNE loc_aa19         ; Then
aa0b: ae 5a 19                  LDX MapLocSpclNum    ;     Set X = MapLocSpclNum
aa0e: bd 53 ab                  LDA SpclEncntrTbl,X  ;     Set
aa11: 8d 20 63                  STA dat_6320         ;         dat_6320 = SpclEncntrTbl[X]
aa14: 85 8d                     STA dat_008d         ;     Set dat_008d = SpclEncntrTbl[X]
aa16: 4c 32 ab                  JMP contRts_ab32     ;     Continue @ $ab32 [contRts_ab32]
                                                     ; End If
aa19: ad 4d 19  loc_aa19        LDA CurZoneFlags     ; If
aa1c: 29 04                     AND #$04             ;    ((CurZoneFlags & 4) != 0)         (TODO: meaning?)
aa1e: f0 05                     BEQ loc_aa25         ; Then
aa20: a9 11                     LDA #$11             ;     Set CurZoneUnk = $11 (17)
aa22: 8d 4c 19                  STA CurZoneUnk       ; End If
aa25: ae 4c 19  loc_aa25        LDX CurZoneUnk       ; If
aa28: e0 0e                     CPX #$0e             ;    (CurZoneUnk == $e (14))           (TODO: encounter free zone?)
aa2a: d0 05                     BNE loc_aa31         ; Then
aa2c: a9 ff                     LDA #$ff             ;     Set dat_6320 = $ff
aa2e: 8d 20 63                  STA dat_6320         ; End If
aa31: ad 3c 63  loc_aa31        LDA ChrExpLevel      ; If (ChrExpLevel == 0)
aa34: d0 16                     BNE loc_aa4c         ; Then
aa36: a2 10     loc_aa36        LDX #$10             ;     Set X = $10 (16)
aa38: ad 0a d2                  LDA RANDOM           ;     Set A = random byte
aa3b: c9 40                     CMP #$40             ;     If (A < $40 (64))
aa3d: b0 16                     BCS loc_aa55         ;     Then
aa3f: ad 46 63                  LDA ChrHp_L          ;         Set
aa42: 0a                        ASL                  ;             A = ChrHp_L * 2
aa43: cd 48 63                  CMP ChrMaxHp_L       ;         If (A < ChrMaxHp_L)
aa46: b0 0d                     BCS loc_aa55         ;         Then
aa48: a9 0f                     LDA #$0f             ;             Set A = $f (15)
aa4a: d0 2f                     BNE loc_aa7b         ;             Continue @ $aa7b [loc_aa7b]
                                                     ;         End If
                                                     ;     End If
aa4c: c9 02     loc_aa4c        CMP #$02             ; Else If (A < 2)                       (2/256 = 0.78% chance)
aa4e: b0 05                     BCS loc_aa55         ; Then
aa50: ad 0a d2                  LDA RANDOM           ;     Set A = random byte
aa53: 30 e1                     BMI loc_aa36         ;     If (A >= 0) Then                  (50% chance)
                                                     ;         Continue @ $aa36 [loc_aa36]
                                                     ;     End If
                                                     ; End If
aa55: bd 73 ac  loc_aa55        LDA tbl_ac73_L,X     ; Loop
aa58: 85 07                     STA SourceAdr_L      ;     Set SourceAdr_L/H
aa5a: bd 85 ac                  LDA tbl_ac73_H,X     ;         to
aa5d: 85 08                     STA SourceAdr_H      ;         tbl_ac73_L/H[X]
aa5f: ad 0a d2                  LDA RANDOM           ;     Set
aa62: 85 96                     STA dat_0096         ;         dat_0096 = random byte
aa64: a0 01                     LDY #$01             ;     Set Y = 1
aa66: b1 07     loc_aa66        LDA (SourceAdr_L),Y  ;     Loop
aa68: c5 96                     CMP dat_0096         ;         If ((*SourceAdr_L)[Y] >= dat_0096) Then
aa6a: b0 04                     BCS loc_aa70         ;             Exit Loop
                                                     ;         End If
aa6c: c8                        INY                  ;         Add 1 to Y
aa6d: c8                        INY                  ;         Add 1 to Y
aa6e: d0 f6                     BNE loc_aa66         ;     Repeat while (Y != 0)
aa70: 88        loc_aa70        DEY                  ;     Subtract 1 from Y
aa71: b1 07                     LDA (SourceAdr_L),Y  ;     Set A = (*SourceAdr_L)[Y]
aa73: 10 06                     BPL loc_aa7b         ;     If (A >= 0) Then
                                                     ;         Exit Loop
                                                     ;     End If
aa75: 29 7f                     AND #$7f             ;     Set
aa77: aa                        TAX                  ;         X = A & $7f
aa78: 4c 55 aa                  JMP loc_aa55         ; Repeat loop
aa7b: 85 8d     loc_aa7b        STA dat_008d         ; Set dat_008d = A
aa7d: c9 0f                     CMP #$0f             ; If
aa7f: d0 0b                     BNE loc_aa8c         ;    (A == $f (15))
aa81: ad 4f 75                  LDA dat_754f         ;    And
aa84: c9 04                     CMP #$04             ;    (dat_754f >= 4)
aa86: 90 04                     BCC loc_aa8c         ; Then
aa88: a9 23                     LDA #$23             ;     Set dat_008d = $23 (35)
aa8a: 85 8d                     STA dat_008d         ; End If
aa8c: ad 20 63  loc_aa8c        LDA dat_6320         ; If (dat_6320 >= 0)
aa8f: 30 17                     BMI loc_aaa8         ; Then
aa91: 85 8d                     STA dat_008d         ;     Set dat_008d = dat_6320
aa93: c9 0f                     CMP #$0f             ;     If
aa95: d0 0e                     BNE loc_aaa5         ;        (dat_6320 == $f (15))
aa97: ad 4f 75                  LDA dat_754f         ;        And
aa9a: c9 05                     CMP #$05             ;        (dat_754f >= 5)
aa9c: 90 07                     BCC loc_aaa5         ;     Then
aa9e: a9 23                     LDA #$23             ;         Set
aaa0: 8d 20 63                  STA dat_6320         ;             dat_6320 = $23 (35)
aaa3: 85 8d                     STA dat_008d         ;         Set dat_008d = $23 (35)
                                                     ;     End If
aaa5: 4c 32 ab  loc_aaa5        JMP contRts_ab32     ;     Continue @ $ab32 [contRts_ab32]
                                                     ; End If
aaa8: a2 3f     loc_aaa8        LDX #$3f             ; Set X = $3f (64 iterations [63..0])
aaaa: a0 00                     LDY #$00             ; Set Y = 0
aaac: bd 4b 64  loc_aaac        LDA InvItemAdr_H,X   ; Loop
aaaf: f0 01                     BEQ loc_aab2         ;     If (InvItemAdr_H[X] != 0) Then
aab1: c8                        INY                  ;         Add 1 to Y
                                                     ;     End If
aab2: ca        loc_aab2        DEX                  ;     Subtract 1 from X
aab3: 10 f7                     BPL loc_aaac         ; Repeat while (X >= 0)
aab5: c0 3a                     CPY #$3a             ; If
aab7: b0 0a                     BCS loc_aac3         ;    (Y >= $3a (58))             (Y = # of items in game inventory)
aab9: ad e5 64                  LDA CHR_ItemsEnd_H   ;
aabc: c9 73                     CMP #$73             ;    Or
aabe: b0 03                     BCS loc_aac3         ;    (CHR_ItemsEnd_H >= $73)
aac0: 4c cd aa                  JMP loc_aacd         ; Then
aac3: a9 00     loc_aac3        LDA #$00             ;     Set
aac5: 85 8d                     STA dat_008d         ;         dat_008d = 0
aac7: ee 8e 63                  INC CHR_638e         ;     Add 1 to CHR_638e
aaca: 4c 32 ab                  JMP contRts_ab32     ;     Continue @ $ab32 [contRts_ab32]
                                                     ; End If
aacd: ad 0a d2  loc_aacd        LDA RANDOM           ; If
aad0: c9 55                     CMP #$55             ;    (random byte >= $55 (85))             (85/256 = 33.20% chance)
aad2: b0 5e                     BCS contRts_ab32     ;    Or
aad4: a5 8d                     LDA dat_008d         ;    (dat_008d != 4)
aad6: c9 04                     CMP #$04             ; Then
aad8: d0 58                     BNE contRts_ab32     ;     Continue @ $ab32 [contRts_ab32]
                                                     ; End If
aada: a2 0d                     LDX #$0d             ; Set X = $d (14 iterations [13..0])   (check faction standings
aadc: a9 00                     LDA #$00             ; Set A = 0                             for any with a value with
aade: 9d 33 ab  loc_aade        STA EnemyFactions,X  ; Loop                                  bit 6 set (enemy?))
                                                     ;     Set EnemyFactions[X] = 0
aae1: ca                        DEX                  ;     Subtract 1 from X
aae2: 10 fa                     BPL loc_aade         ; Repeat while (X >= 0)
aae4: a0 ff                     LDY #$ff             ; Set Y = $ff
aae6: a2 0d                     LDX #$0d             ; Set X = $d (14 iterations [13..0])
aae8: bd c2 63  loc_aae8        LDA FactionRepute,X  ; Loop
aaeb: 29 40                     AND #$40             ;     If ((FactionRepute[X] & $40 (64)) != 0)
aaed: f0 05                     BEQ loc_aaf4         ;     Then
aaef: c8                        INY                  ;         Add 1 to Y
aaf0: 8a                        TXA                  ;         Set EnemyFactions[Y] = X    (add faction to list)
aaf1: 99 33 ab                  STA EnemyFactions,Y  ;     End If
aaf4: ca        loc_aaf4        DEX                  ;     Subtract 1 from X
aaf5: 10 f1                     BPL loc_aae8         ; Repeat while (X >= 0)
aaf7: ad 86 63                  LDA CHR_MORALE       ; If
aafa: c9 48                     CMP #$48             ;    (CHR_MORALE < $48 (72))
aafc: b0 06     loc_aafc        BCS loc_ab04         ; Then
aafe: c8                        INY                  ;     Add 1 to Y                   (add faction to list)
aaff: a9 0e     loc_aaff        LDA #$0e             ;     Set EnemyFactions[Y] = $0e   ($e = "a friend")
ab01: 99 33 ab                  STA EnemyFactions,Y  ; End If
ab04: ad 87 63  loc_ab04        LDA CHR_Unk_6387     ; If
ab07: c9 10                     CMP #$10             ;    (CHR_Unk_6387 >= $10 (16))
ab09: 90 06                     BCC loc_ab11         ; Then
ab0b: c8                        INY                  ;     Add 1 to Y                   (add faction to list)
ab0c: 99 33 ab                  STA EnemyFactions,Y  ;     Set EnemyFactions[Y] = A     (BUG: should be swapped)
ab0f: a9 0f                     LDA #$0f             ;     Set A = $f (15)              ($f = "The Palace")
                                                     ; End If
ab11: 98        loc_ab11        TYA                  ; Set A = Y                        (A, Y = 0..15)
ab12: 30 1e                     BMI contRts_ab32     ; If (A >= 0) Then           (select a random faction if any found)
ab14: 20 99 18                  JSR j_randInRange    ;     Call $1899 [j_randInRange] (in A, out A)
ab17: aa                        TAX                  ;     Set X = A
ab18: bd 33 ab                  LDA EnemyFactions,X  ;     Set
ab1b: aa                        TAX                  ;         X = EnemyFactions[X]
ab1c: bd 43 ab                  LDA FactionFoes,X    ;     Set
ab1f: 85 8d                     STA dat_008d         ;         dat_008d = FactionFoes[X]
ab21: 86 af                     STX dat_00af         ;     Set dat_00af = X
ab23: bd 2b 9a                  LDA FactionNames_L,X ;     Set
ab26: 8d dd 76                  STA FactionNmZts_L   ;         FactionNmZts_L/H
ab29: bd 3b 9a                  LDA FactionNames_H,X ;         to
ab2c: 8d de 76                  STA FactionNmZts_H   ;         FactionNames_L/H[X]
ab2f: ee 8e 63                  INC CHR_638e         ;     Add 1 to CHR_638e
                                                     ; End If
ab32: 60        contRts_ab32    RTS                  ; Return to caller

ab33: 00 00 00  EnemyFactions   .BYTE $00,$00,$00                      ; 16 bytes: sub_aa00 assigns faction indexes you
ab36: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ;     have become an enemy of into this table for
ab3e: 00 00 00 00 00            .BYTE $00,$00,$00,$00,$00              ;     randomly choosing a faction foe.

ab43: 0e 05 0e  FactionFoes     .BYTE $0e,$05,$0e                      ; 16 bytes: Foes sent by the various factions you
ab46: 0d 0e 05 0e 05 0e 0d 0e   .BYTE $0d,$0e,$05,$0e,$05,$0e,$0d,$0e  ;     have become an enemy of, indexed by faction
ab4e: 05 0e 3c 05 0b            .BYTE $05,$0e,$3c,$05,$0b              ;     number.

ab53: 09 09 09  SpclEncntrTbl   .BYTE $09,$09,$09                      ; 32 bytes: Special encounter foe IDs, indexed by
ab56: 09 09 09 09 47 3d 08 3a   .BYTE $09,$09,$09,$09,$47,$3d,$08,$3a  ;     map cell special code index (MapLocSpclNum)
ab5e: 45 2d 34 1f 2e 25 27 36   .BYTE $45,$2d,$34,$1f,$2e,$25,$27,$36  ;   0: $09 - Undead Knight
ab66: 3d 4c 22 28 23 2b 34 3a   .BYTE $3d,$4c,$22,$28,$23,$2b,$34,$3a  ;   1: $09 - Undead Knight
ab6e: 4c 2e 27 3d 00            .BYTE $4c,$2e,$27,$3d,$00              ;   2: $09 - Undead Knight
                                                                       ;   3: $09 - Undead Knight
                                                                       ;   4: $09 - Undead Knight
                                                                       ;   5: $09 - Undead Knight
                                                                       ;   6: $09 - Undead Knight
                                                                       ;   7: $47 - Basilisk
                                                                       ;   8: $3d - Doppleganger
                                                                       ;   9: $08 - Lich
                                                                       ;  10: $3a - Valkyrie
                                                                       ;  11: $45 - Great Naga
                                                                       ;  12: $2d - 3 Wraiths
                                                                       ;  13: $34 - 4 Flame Demons
                                                                       ;  14: $1f - 7 Dwarves
                                                                       ;  15: $2e - Vampire
                                                                       ;  16: $25 - Whirlwind
                                                                       ;  17: $27 - Small Dragon
                                                                       ;  18: $36 - 3 Giant Wolves
                                                                       ;  19: $3d - Doppleganger
                                                                       ;  20: $4c - Horned devil
                                                                       ;  21: $22 - 7 Homunculii of The Blue Wizards
                                                                       ;  22: $28 - 8 Skeletons
                                                                       ;  23: $23 - Phoenix
                                                                       ;  24: $2b - Ghost
                                                                       ;  25: $34 - 4 Flame demons
                                                                       ;  26: $3a - Valkyrie
                                                                       ;  27: $4c - Horned devil
                                                                       ;  28: $2e - Vampire
                                                                       ;  29: $27 - Small dragon
                                                                       ;  30: $3d - Doppleganger
                                                                       ;  31: #00 - Devourer

ab73: 89                        .BYTE $89
ab74: 30 86                     BMI loc_aafc         ; 0.
ab76: 50 87                     BVC loc_aaff         ; P.
ab78: 60                        RTS                  ; `
ab79: 85 70                     STA dat_0070_L       ; .p
ab7b: 84 80                     STY dat_0080         ; ..
ab7d: 8a                        TXA                  ; .
ab7e: a0 88                     LDY #$88             ; ..
ab80: c0 81                     CPY #$81             ; ..
ab82: e0 8b                     CPX #$8b             ; ..
ab84: ff 2f                     .BYTE $ff,$2f        ; ./
ab86: 20 29 40                  JSR $4029            ;  )@
ab89: 2a                        ROL                  ; *
ab8a: 60                        RTS                  ; `
ab8b: 28                        PLP                  ; (
ab8c: 80 2b                     .BYTE $80,$2b        ; .+
ab8e: 90 2c                     BCC loc_abbc         ; .,
ab90: a0 2d                     LDY #$2d             ; .-
ab92: b0 2e                     BCS loc_abc2         ; ..
ab94: d0 08                     BNE loc_ab9e         ; ..
ab96: e0 88                     CPX #$88             ; ..
ab98: f0 8b                     BEQ loc_ab25         ; ..
ab9a: ff                        .BYTE $ff            ; .
ab9b: 36 40                     ROL CurEffAdr_H,X    ; 6@
ab9d: 06 ff                     ASL FPTR2+1          ; ..
ab9f: 1d 40 07                  ORA DISP_START+832,X  ; .@.
aba2: ff 3f                     .BYTE $ff,$3f        ; .?
aba4: 40        loc_aba4        RTI                  ; @
aba5: 43        loc_aba5        .BYTE $43            ; C
aba6: 80 44                     .BYTE $80,$44        ; .D
aba8: c0 40                     CPY #$40             ; .@
abaa: ff                        .BYTE $ff            ; .
abab: 41 30                     EOR (KbdPendChar,X)  ; A0
abad: 27                        .BYTE $27            ; '
abae: 60                        RTS                  ; `
abaf: 30 90                     BMI loc_ab41         ; 0.
abb1: 23                        .BYTE $23            ; #
abb2: c0 34                     CPY #$34             ; .4
abb4: ff                        .BYTE $ff            ; .
abb5: 1e 40 1f                  ASL $1f40,X          ; .@.
abb8: 80 82                     .BYTE $80,$82        ; ..
abba: c0 83                     CPY #$83             ; ..
abbc: ff        loc_abbc        .BYTE $ff            ; .
abbd: 31 30                     AND (KbdPendChar),Y  ; 10
abbf: 25 60                     AND NEWROW           ; %`
abc1: 23                        .BYTE $23            ; #
abc2: 90 35     loc_abc2        BCC loc_abf9         ; .5
abc4: b0 3a                     BCS ModuleStart+13824  ; .:
abc6: d0 45                     BNE bad_ac0d         ; .E
abc8: ff                        .BYTE $ff            ; .
abc9: 35 18                     AND OutGetWord_L,X   ; 5.
abcb: 30 30                     BMI loc_abfd         ; 00
abcd: 32                        .BYTE $32            ; 2
abce: 48                        PHA                  ; H
abcf: 33                        .BYTE $33            ; 3
abd0: 60                        RTS                  ; `
abd1: 4b                        .BYTE $4b            ; K
abd2: 78                        SEI                  ; x
abd3: 4c 90 34                  JMP $3490            ; L.4
abd6: a0 3d                     LDY #$3d             ; .=
abd8: b8                        CLV                  ; .
abd9: 81 e0                     STA (FR1,X)          ; ..
abdb: 8b ff 12 12               .BYTE $8b,$ff,$12,$12  ; ....
abdf: 16 1a                     ASL OutTempA,X       ; ..
abe1: 17 22 1b                  .BYTE $17,$22,$1b    ; .".
abe4: 2a                        ROL                  ; *
abe5: 13 34 0f                  .BYTE $13,$34,$0f    ; .4.
abe8: 46 0a                     LSR DestAdr_H        ; F.
abea: 50 0d                     BVC loc_abf9         ; P.
abec: 5a                        .BYTE $5a            ; Z
abed: 10 64                     BPL loc_ac53         ; .d
abef: 22                        .BYTE $22            ; "
abf0: 70 1c                     BVS loc_ac0e         ; p.
abf2: 80                        .BYTE $80            ; .
abf3: 18                        CLC                  ; .
abf4: 8c 24 96                  STY ModuleStart+8228  ; .$.
abf7: 19 a0 1a                  ORA $1aa0,Y          ; ...
abfa: a8                        TAY                  ; .
abfb: 08                        PHP                  ; .
abfc: ae 39 b8                  LDX MapStart+3129    ; .9.
abff: 42        bad_abff        .BYTE $42            ; B
ac00: c2        MapNumber       .BYTE $c2            ; .
ac01: 3b        MapDescTbl_L    .BYTE $3b            ; ;
ac02: ca        MapDescTbl_H    .BYTE $ca            ; .
ac03: 3e        MAP_DescFragTbl  .BYTE $3e           ; >
ac04: d8                        CLD                  ; .
ac05: 38                        SEC                  ; 8
ac06: e0 8b                     CPX #$8b             ; ..
ac08: ff                        .BYTE $ff            ; .
ac09: 26 20                     ROL OutRow           ; &
ac0b: 2f                        .BYTE $2f            ; /
ac0c: 40                        RTI                  ; @
ac0d: 20 60 21  bad_ac0d        JSR $2160            ;  `!
ac10: 80                        .BYTE $80            ; .
ac11: 36 90                     ROL MEMTOP,X         ; 6.
ac13: 37                        .BYTE $37            ; 7
ac14: a0 22                     LDY #$22             ; ."
ac16: b0 84                     BCS loc_ab9c         ; ..
ac18: d0 8b                     BNE loc_aba5         ; ..
ac1a: e0 89                     CPX #$89             ; ..
ac1c: f0 86                     BEQ loc_aba4         ; ..
ac1e: ff                        .BYTE $ff            ; .
ac1f: 01 30                     ORA (KbdPendChar,X)  ; .0
ac21: 02                        .BYTE $02            ; .
ac22: 50 03                     BVC loc_ac27         ; P.
ac24: 70 3c                     BVS loc_ac62         ; p<
ac26: a0 3e                     LDY #$3e             ; .>
ac28: b0 0f                     BCS loc_ac39         ; ..
ac2a: c0 04                     CPY #$04             ; ..
ac2c: ff                        .BYTE $ff            ; .
ac2d: 3d 30 40                  AND $4030,X          ; =0@
ac30: 50 1f                     BVC loc_ac51         ; P.
ac32: 60                        RTS                  ; `
ac33: 4b                        .BYTE $4b            ; K
ac34: c0 89                     CPY #$89             ; ..
ac36: ff 2b 80                  .BYTE $ff,$2b,$80    ; .+.
ac39: 2c ff 14  loc_ac39        BIT DungeonCharset+255  ; ,..
ac3c: 40                        RTI                  ; @
ac3d: 15 ff                     ORA FPTR2+1,X        ; ..
ac3f: 0a                        ASL                  ; .
ac40: d0 04                     BNE bad_ac46         ; ..
ac42: ff 2f                     .BYTE $ff,$2f        ; ./
ac44: 30 26                     BMI loc_ac6c         ; 0&
ac46: 60        bad_ac46        RTS                  ; `
ac47: 20 70 21                  JSR $2170            ;  p!
ac4a: 80 0f                     .BYTE $80,$0f        ; ..
ac4c: a0 12                     LDY #$12             ; ..
ac4e: b8                        CLV                  ; .
ac4f: 01 d0     loc_ac4f        ORA ($d0,X)          ; ..
ac51: 16 e0     loc_ac51        ASL FR1,X            ; ..
ac53: 17        loc_ac53        .BYTE $17            ; .
ac54: f0 1b                     BEQ loc_ac71         ; ..
ac56: ff 12                     .BYTE $ff,$12        ; ..
ac58: 20 16 30                  JSR $3016            ;  .0
ac5b: 17                        .BYTE $17            ; .
ac5c: 40                        RTI                  ; @
ac5d: 1b                        .BYTE $1b            ; .
ac5e: 50 13                     BVC tbl_ac73_L         ; P.
ac60: 68                        PLA                  ; h
ac61: 0f                        .BYTE $0f            ; .
ac62: 80        loc_ac62        .BYTE $80            ; .
ac63: 0a                        ASL                  ; .
ac64: 88                        DEY                  ; .
ac65: 10 98                     BPL bad_abff         ; ..
ac67: 22                        .BYTE $22            ; "
ac68: a8                        TAY                  ; .
ac69: 1c                        .BYTE $1c            ; .
ac6a: b8                        CLV                  ; .
ac6b: 18                        CLC                  ; .
ac6c: c8        loc_ac6c        INY                  ; .
ac6d: 90 e0                     BCC loc_ac4f         ; ..
ac6f: 89                        .BYTE $89            ; .
ac70: e8                        INX                  ; .
ac71: 8b        loc_ac71        .BYTE $8b            ; .
ac72: ff                        .BYTE $ff            ; .

ac73: 73 85 9b  tbl_ac73_L      .BYTE $73,$85,$9b                      ; s..
ac76: 9f a3 ab b5 bd c9 dd 09   .BYTE $9f,$a3,$ab,$b5,$bd,$c9,$dd,$09  ; ........
ac7e: 1f 2d 37 3b 3f 43 57      .BYTE $1f,$2d,$37,$3b,$3f,$43,$57      ; .-7;?CW

ac85: ab ab ab  tbl_ac73_H      .BYTE $ab,$ab,$ab                      ; ...
ac88: ab ab ab ab ab ab ab ac   .BYTE $ab,$ab,$ab,$ab,$ab,$ab,$ab,$ac  ; ........
ac90: ac ac ac ac ac ac ac      .BYTE $ac,$ac,$ac,$ac,$ac,$ac,$ac      ; .......

ac97: 46 02                     LSR UInt16Val_L      ; F.
ac99: 1d 05 00                  ORA MBTemp2,X        ; ...
ac9c: 00                        BRK                  ; .
ac9d: 00                        BRK                  ; .
ac9e: 00                        BRK                  ; .
ac9f: 00                        BRK                  ; .
aca0: 00                        BRK                  ; .
aca1: 12                        .BYTE $12            ; .
aca2: 01 ad                     ORA ($ad,X)          ; ..
aca4: 01 36                     ORA (TimeHour,X)     ; .6
aca6: 01 9f                     ORA ($9f,X)          ; ..
aca8: 00                        BRK                  ; .
aca9: f7                        .BYTE $f7            ; .
acaa: 00                        BRK                  ; .
acab: f9 03 00                  SBC UInt16Val_H,Y    ;
acae: 00                        BRK                  ; .
acaf: 98                        TYA                  ; .
acb0: 00                        BRK                  ; .
acb1: d0 00                     BNE loc_acb3         ; ..
acb3: 15 01     loc_acb3        ORA SioBufPos_H,X    ; ..
acb5: 37 03                     .BYTE $37,$03        ; 7.
acb7: b4 01                     LDY SioBufPos_H,X    ; ..
acb9: 00                        BRK                  ; .
acba: 00                        BRK                  ; .
acbb: d2                        .BYTE $d2            ; .
acbc: 01 4b                     ORA (ItemIndex,X)    ; .K
acbe: 01 b9                     ORA ($b9,X)          ; ..
acc0: 00                        BRK                  ; .
acc1: f8                        SED                  ; .
acc2: 00                        BRK                  ; .
acc3: c4 00                     CPY SioBufPos_L      ; ..
acc5: c0 00                     CPY #$00             ; ..
acc7: b7                        .BYTE $b7            ; .
acc8: 00                        BRK                  ; .
acc9: 7f                        .BYTE $7f            ; .
acca: 01 00                     ORA (SioBufPos_L,X)  ; ..
accc: 00                        BRK                  ; .
accd: ef                        .BYTE $ef            ; .
acce: 00                        BRK                  ; .
accf: 46 01                     LSR SioBufPos_H      ; F.
acd1: b9 00 9c                  LDA ModuleStart+9728,Y  ; ...
acd4: 00                        BRK                  ; .
acd5: c5 00                     CMP SioBufPos_L      ; ..
acd7: 3e 01 e4                  ROL TEX_Copy+2049,X  ; >..
acda: 00                        BRK                  ; .
acdb: 96 00                     STX SioBufPos_L,Y    ; ..
acdd: ba                        TSX                  ; .
acde: 00                        BRK                  ; .
acdf: e9 00                     SBC #$00             ; ..
ace1: 01 01                     ORA (SioBufPos_H,X)  ; ..
ace3: d1 00                     CMP (SioBufPos_L),Y  ; ..
ace5: c1 00                     CMP (SioBufPos_L,X)  ; ..
ace7: be 00 bc                  LDX MapStart+4096,Y  ; ...
acea: 00                        BRK                  ; .
aceb: 04                        .BYTE $04            ; .
acec: 01 ab                     ORA ($ab,X)          ; ..
acee: 00                        BRK                  ; .
acef: a5 00                     LDA SioBufPos_L      ; ..
acf1: 0b                        .BYTE $0b            ; .
acf2: 01 18                     ORA (OutGetWord_L,X) ; ..
acf4: 01 c3                     ORA (dat_00c3,X)     ; ..
acf6: 00                        BRK                  ; .
acf7: d6 00                     DEC SioBufPos_L,X    ; ..
acf9: db                        .BYTE $db            ; .
acfa: 00                        BRK                  ; .
acfb: be 00 c6                  LDX MAP_CopySeg1+1536,Y  ; ...
acfe: 00                        BRK                  ; .
acff: 84 01                     STY SioBufPos_H      ; ..
ad01: b2                        .BYTE $b2            ; .
ad02: 00                        BRK                  ; .
ad03: 8a                        TXA                  ; .
ad04: 00                        BRK                  ; .
ad05: 0b                        .BYTE $0b            ; .
ad06: 01 c0                     ORA ($c0,X)          ; ..
ad08: 00                        BRK                  ; .
ad09: cd 00 84                  CMP sub_8400         ; ...
ad0c: 00                        BRK                  ; .
ad0d: 87                        .BYTE $87            ; .
ad0e: 00                        BRK                  ; .
ad0f: 8c 00 e2                  STY TEX_Copy+1536    ; ...
ad12: 00                        BRK                  ; .
ad13: a9 00                     LDA #$00             ; ..
ad15: 76 00                     ROR SioBufPos_L,X    ; v.
ad17: bf                        .BYTE $bf            ; .
ad18: 00                        BRK                  ; .
ad19: bc 00 04                  LDY DISP_START,X     ; ...
ad1c: 01 bb                     ORA (STOPLN+1,X)     ; ..
ad1e: 00                        BRK                  ; .
ad1f: a6 00                     LDX SioBufPos_L      ; ..
ad21: 83                        .BYTE $83            ; .
ad22: 00                        BRK                  ; .
ad23: d3                        .BYTE $d3            ; .
ad24: 00                        BRK                  ; .
ad25: 0e 02 d7                  ASL $d702            ; ...
ad28: 00                        BRK                  ; .
ad29: db                        .BYTE $db            ; .
ad2a: 00                        BRK                  ; .
ad2b: e5 00                     SBC SioBufPos_L      ; ..
ad2d: 82                        .BYTE $82            ; .
ad2e: 00                        BRK                  ; .
ad2f: b4 00                     LDY SioBufPos_L,X    ; ..

                ;
                ; Below seems to be a copy of $a4af thru $a57d (207 bytes)
                ;

ad31: a4 a4 a6  unk_ad31        .BYTE $a4,$a4,$a6                      ; ...
ad34: 00 02 a5 59 6f 75 20 62   .BYTE $00,$02,$a5,$59,$6f,$75,$20,$62  ; ...You b
ad3c: 6c 6f 63 6b 20 77 69 74   .BYTE $6c,$6f,$63,$6b,$20,$77,$69,$74  ; lock wit
ad44: 68 20 79 6f 75 72 0d a5   .BYTE $68,$20,$79,$6f,$75,$72,$0d,$a5  ; h your..
ad4c: b4 3e 9e 1e 2e 0d ff ac   .BYTE $b4,$3e,$9e,$1e,$2e,$0d,$ff,$ac  ; .>......
ad54: 53 76 66 6c 65 65 73 21   .BYTE $53,$76,$66,$6c,$65,$65,$73,$21  ; Svflees!
ad5c: 0d ff ac 53 76 66 6c 69   .BYTE $0d,$ff,$ac,$53,$76,$66,$6c,$69  ; ...Svfli
ad64: 65 73 20 61 77 61 79 21   .BYTE $65,$73,$20,$61,$77,$61,$79,$21  ; es away!
ad6c: 0d ff ac 53 76 6c 65 61   .BYTE $0d,$ff,$ac,$53,$76,$6c,$65,$61  ; ...Svlea
ad74: 76 65 73 2e 0d ff 50 72   .BYTE $76,$65,$73,$2e,$0d,$ff,$50,$72  ; ves...Pr
ad7c: 6f 74 65 63 74 69 6f 6e   .BYTE $6f,$74,$65,$63,$74,$69,$6f,$6e  ; otection
ad84: 00 53 74 72 65 6e 67 74   .BYTE $00,$53,$74,$72,$65,$6e,$67,$74  ; .Strengt
ad8c: 68 00 41 67 69 6c 69 74   .BYTE $68,$00,$41,$67,$69,$6c,$69,$74  ; h.Agilit
ad94: 79 00 46 69 6e 67 65 72   .BYTE $79,$00,$46,$69,$6e,$67,$65,$72  ; y.Finger
ad9c: 20 6f 66 20 44 65 61 74   .BYTE $20,$6f,$66,$20,$44,$65,$61,$74  ;  of Deat
ada4: 68 00 50 61 72 61 6c 79   .BYTE $68,$00,$50,$61,$72,$61,$6c,$79  ; h.Paraly
adac: 73 69 73 00 46 69 72 65   .BYTE $73,$69,$73,$00,$46,$69,$72,$65  ; sis.Fire
adb4: 62 61 6c 6c 00 43 6f 6c   .BYTE $62,$61,$6c,$6c,$00,$43,$6f,$6c  ; ball.Col
adbc: 64 20 43 6f 6e 65 00 4c   .BYTE $64,$20,$43,$6f,$6e,$65,$00,$4c  ; d Cone.L
adc4: 69 67 68 74 6e 69 6e 67   .BYTE $69,$67,$68,$74,$6e,$69,$6e,$67  ; ightning
adcc: 00 4d 69 6e 64 20 46 6c   .BYTE $00,$4d,$69,$6e,$64,$20,$46,$6c  ; .Mind Fl
add4: 61 69 6c 00 53 75 66 66   .BYTE $61,$69,$6c,$00,$53,$75,$66,$66  ; ail.Suff
addc: 6f 63 61 74 69 6f 6e 00   .BYTE $6f,$63,$61,$74,$69,$6f,$6e,$00  ; ocation.
ade4: 52 65 70 75 6c 73 69 6f   .BYTE $52,$65,$70,$75,$6c,$73,$69,$6f  ; Repulsio
adec: 6e 00 42 6c 69 6e 6b 00   .BYTE $6e,$00,$42,$6c,$69,$6e,$6b,$00  ; n.Blink.
adf4: f8 03 0c 14 24 2e 37 41   .BYTE $f8,$03,$0c,$14,$24,$2e,$37,$41  ; ....$.7A
adfc: 4b 56 62 6c               .BYTE $4b,$56,$62,$6c                  ; KVbl
