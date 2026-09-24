
; 0000 L20f0 @7600 [exe]
* = $7600

7600: 00        ModuleNumber    .BYTE $00            ; Module # 0

7601: 4c 12 76  moduleEntry1    JMP sub_7612         ; Alias for sub_7612
7604: 4c 0c 76  moduleEntry2    JMP sub_760c         ; Alias for sub_760c
7607: 4c 0c 76  moduleEntry3    JMP sub_760c         ; Alias for sub_760c

760a: 6f        Mod0DescTbl_L   .BYTE $6f            ; LSB of special location message table $856f [SpclMesgAdrs]
760b: 85        Mod0DescTbl_H   .BYTE $85            ; MSB of special location message table $856f [SpclMesgAdrs]

                ; Sets dat_192a to 0 (invalidate status page 7)
                ;
760c: a9 00     sub_760c        LDA #$00             ; Set
760e: 8d 2a 19                  STA dat_192a         ;     dat_192a = 0         (invalidate status page 7)
7611: 60                        RTS                  ; Return to caller

                ;
                ; - Sets the display mode to 1
                ; - Copies time-critical sub at dat_78a2 to zero page cont_0090
                ; -
                ;
7612: ad b9 18  sub_7612        LDA CUR_DLIST_NUM    ; If
7615: c9 01                     CMP #$01             ;    (CUR_DLIST_NUM != 1)
7617: f0 05                     BEQ loc_761e         ; Then
7619: a9 01                     LDA #$01             ;     Set A = 1
761b: 20 0f 18                  JSR j_setDisplayMode ;     Call [j_setDisplayMode]
                                                     ; End If
761e: a9 41     loc_761e        LDA #$41             ; Set
7620: 8d 77 19                  STA cont_addr_1977_L ;     cont_addr_1977_L/H
7623: a9 76                     LDA #$76             ;     to
7625: 8d 78 19                  STA cont_addr_1977_H ;     $7641 [cont_7641]
7628: a2 48                     LDX #$48             ; Set X = $48 (72)
762a: bd a2 78  loc_762a        LDA dat_78a2,X       ; Loop
                                                     ;     Set
762d: 95 90                     STA cont_0090,X      ;         cont_0090[X] = dat_78a2[X]
762f: ca                        DEX                  ;     Subtract 1 from X
7630: 10 f8                     BPL loc_762a         ; Repeat while (X >= 0)
7632: 8e 75 19                  STX UNK_BYTE_1975    ; Set UNK_BYTE_1975 = $ff  (X = $ff)
7635: e8                        INX                  ; Add 1 to X               (X = 0)
7636: 86 32                     STX TimePaused       ; Set TimePaused = 0               (time is not paused)
7638: 86 0f                     STX DisableEffects   ; Set DisableEffects = 0           (effects not disabled)
763a: 8e 37 19                  STX AllowActions     ; Set AllowActions = 0             (allow user kbd actions)
763d: 8e 55 78                  STX PlayerIsMoving   ; Set PlayerIsMoving = 0           (player is not moving)
7640: 60                        RTS                  ; Return to caller

                ;
                ; - 7.8% chance of getting Crystal Doom if in Crystal Caverns (Level 2 Zone 1)
                ; - Teleports player from Hall of the Adept (Level 2 Zone 8 [28,14]) to Level 1.1 [0,1] if conditions are met
                ; - Player may randomly drop item if their burden is maxed at 255
                ;
                ;
7641: 2c 75 19  cont_7641       BIT UNK_BYTE_1975    ; If
7644: 30 03                     BMI loc_7649         ;    (UNK_BYTE_1975 < 0)
7646: 4c f7 76                  JMP loc_76f7         ; Then
7649: 20 37 7a  loc_7649        JSR sub_7a37         ;     Call $7a37 [sub_7a37]
764c: 20 4d 7e                  JSR sub_7e4d         ;     Call $7e4d [sub_7e4d]
764f: ad 15 63                  LDA CHR_LOC_MAP      ;     If
7652: c9 04                     CMP #$04             ;        (CHR_LOC_MAP == 4)            (4 = Level 2 map)
7654: d0 4a                     BNE loc_76a0         ;     Then
7656: ad 12 19                  LDA CurZoneId        ;         If
7659: c9 01                     CMP #$01             ;            (CurZoneId == 1)          (Crystal Caverns)
765b: d0 11                     BNE loc_766e         ;
765d: ad 0a d2                  LDA RANDOM           ;            And
7660: c9 ec                     CMP #$ec             ;            (Random byte >= $ec)      (20/256 = 7.8% chance)
7662: 90 0a                     BCC loc_766e         ;         Then
7664: a2 77                     LDX #$77             ;             Set
7666: a0 fd                     LDY #$fd             ;                 Y/X = $77fd [item_77fd]
7668: 20 84 18                  JSR j_addItem        ;             Call $1884 [j_addItem]
766b: 4c a0 76                  JMP loc_76a0         ;         Else If
766e: ad 12 19  loc_766e        LDA CurZoneId        ;            (CurZoneId == 8)          (Hall of the Adept - Black)
7671: c9 08                     CMP #$08             ;
7673: d0 2b                     BNE loc_76a0         ;            And
7675: ad 88 63                  LDA Chr_Unk_6388     ;            (Chr_Unk_6388 & 2 != 0)
7678: 29 02                     AND #$02             ;
767a: f0 24                     BEQ loc_76a0         ;            And
767c: ad 15 63                  LDA CHR_LOC_MAP      ;            (CHR_LOC_MAP == 4)        (4 = Level 2 map, dup check)
767f: c9 04                     CMP #$04             ;
7681: d0 1d                     BNE loc_76a0         ;         Then
7683: a9 00                     LDA #$00             ;             Set
7685: 8d 13 63                  STA CHR_LOC_X        ;                 CHR_LOC_X = 0
7688: a9 01                     LDA #$01             ;             Set
768a: 8d 14 63                  STA CHR_LOC_Y        ;                 CHR_LOC_Y = 1
768d: 8d 15 63                  STA CHR_LOC_MAP      ;             Set CHR_LOC_MAP = 1
7690: a9 00                     LDA #$00             ;             Set
7692: 8d 2a 19                  STA dat_192a         ;                 dat_192a = 0
7695: a9 ff                     LDA #$ff             ;             Set
7697: 8d 75 19                  STA UNK_BYTE_1975    ;                 UNK_BYTE_1975 = $ff
769a: ce 56 19                  DEC UNK_BYTE_COUNTER ;             Subtract 1 from UNK_BYTE_COUNTER
769d: 4c 0c 18                  JMP j_loc_3183       ;             Continue @ $3183 [j_loc_3183]
                                                     ;         End If
                                                     ;     End If
                ;
                ; May randomly drop an item if the player is moving and the player's burden level is maxed (255).
                ;
                ; The chance an item is dropped depends on the number of items held by the player, and is
                ; approximately equal to 50% * NumItemsHeld / 64. The chance may be lower, as special items (type 7)
                ; are excluded from being dropped.
                ;
76a0: ad 55 78  loc_76a0        LDA PlayerIsMoving   ;     If
76a3: 10 2a                     BPL loc_76cf         ;        (PlayerIsMoving < 0)            (player is moving)
76a5: ad 0a d2                  LDA RANDOM           ;        And
76a8: 10 25                     BPL loc_76cf         ;        (Random byte < 0)               (50% chance)
76aa: ae 94 63                  LDX CHR_BURDEN       ;        And
76ad: e8                        INX                  ;        (CHR_BURDEN + 1 == 0)           (burden = 255)
76ae: d0 1f                     BNE loc_76cf         ;        And
76b0: a9 3f                     LDA #$3f             ;           Set A = $3f (63)
76b2: 20 99 18                  JSR j_randInRange    ;           Call $1899 [j_randInRange]   (A = random value 0..63)
76b5: 20 87 18                  JSR j_getItemAdr     ;           Call $1887 [j_getItemAdr]    (get random item addr)
76b8: f0 15                     BEQ loc_76cf         ;        (ItemAdr_H != 0)                (item in slot)
76ba: a0 00                     LDY #$00             ;        And
76bc: b1 41                     LDA (ItemAdr_L),Y    ;        ((*ItemAdr_L)[0] < 0)           (item held by player)
76be: 10 0f                     BPL loc_76cf         ;
76c0: 29 07                     AND #$07             ;        And
76c2: c9 01                     CMP #$01             ;        ((*ItemAdr_L)[0] & 7 != 1)      (not a special/quest item)
76c4: f0 09                     BEQ loc_76cf         ;     Then
76c6: a9 02                     LDA #$02             ;         Set (*ItemAdr_L)[2]
76c8: a0 02                     LDY #$02             ;                 =
76ca: 91 41                     STA (ItemAdr_L),Y    ;                   2                    (set trigger to "drop")
76cc: 20 a5 18                  JSR j_sub_408b       ;         Call $18a5 [j_sub_408b]
                                                     ;     End If
                ;
                ; If the player moved into a zone with a different texture set, load the new texture set
                ;
76cf: ad 4b 19  loc_76cf        LDA CurZoneTex       ;     If
76d2: cd f0 96                  CMP TexNumber        ;        (CurZoneTex != TexNumber)
76d5: f0 1a                     BEQ loc_76f1         ;     Then
76d7: 48                        PHA                  ;         Push A onto the stack      (A = CurZoneTex)
76d8: a9 00                     LDA #$00             ;         Set A = 0                  (0 = black)
76da: 20 e5 77                  JSR setAllColors     ;         Call $77e5 [setAllColors]
76dd: 68                        PLA                  ;         Restore A from the stack   (A = CurZoneTex)
76de: 18                        CLC                  ;         Set FileNumber
76df: 69 07                     ADC #$07             ;                =
76e1: 8d 09 19                  STA FileNumber       ;                  CurZoneTex + 7
76e4: a9 f0                     LDA #$f0             ;         Set
76e6: 8d 0b 19                  STA FileDestAdr_L    ;             FileDestAdr_L/H
76e9: a9 96                     LDA #$96             ;                =
76eb: 8d 0c 19                  STA FileDestAdr_H    ;                  $96f0 [TextureStart]
76ee: 20 42 18                  JSR j_sub_2cad       ;         Call $1842 [j_sub_2cad]
                                                     ;     End If
76f1: 20 d4 7a  loc_76f1        JSR sub_7ad4         ;     Call $7ad4 [sub_7ad4]
76f4: 4c 36 77                  JMP loc_7736         ; Else If                            (UNK_BYTE_1975 is >= 0 here)
76f7: 2c 54 19  loc_76f7        BIT dat_1954         ;    (dat_1954 < 0)
76fa: 10 37                     BPL loc_7733         ; Then
76fc: a9 03                     LDA #$03             ;     Set
76fe: 8d fa 77                  STA dat_77fa         ;         dat_77fa = 3  (4 iterations [3..0])
7701: a9 34     loc_7701        LDA #$34             ;     Loop
                                                     ;         Set A = $34 (52)                      ($34 = Dark Orange)
7703: 20 e5 77                  JSR setAllColors     ;         Call $77e5 [setAllColors]
7706: ad 52 02                  LDA VBlankCounter    ;         Set A = VBlankCounter
7709: cd 52 02  loc_7709        CMP VBlankCounter    ;         Loop
770c: f0 fb                     BEQ loc_7709         ;         Repeat While (A == VBlankCounter)     (wait for vblank)
770e: ad 4d 19                  LDA CurZoneFlags     ;         If
7711: 29 01                     AND #$01             ;            (((CurZoneFlags & 1) | CHR_NumLights) == 0)
7713: 0d 90 63                  ORA CHR_NumLights    ;
7716: d0 08                     BNE loc_7720         ;         Then
7718: a9 00                     LDA #$00             ;             Set A = 0                         (0 = black)
771a: 20 e5 77                  JSR setAllColors     ;             Call $77e5 [setAllColors]         (darkness)
771d: 4c 23 77                  JMP loc_7723         ;         Else
7720: 20 ee 77  loc_7720        JSR applyZoneClrs    ;             Call $77ee [applyZoneClrs]        (we can see!)
                                                     ;         End If
7723: ad 52 02  loc_7723        LDA VBlankCounter    ;         Set A = VBlankCounter
7726: cd 52 02  loc_7726        CMP VBlankCounter    ;         Loop
7729: f0 fb                     BEQ loc_7726         ;         Repeat While (A == VBlankCounter)     (wait for vblank)
772b: ce fa 77                  DEC dat_77fa         ;         Subtract 1 from dat_77fa
772e: 10 d1                     BPL loc_7701         ;     Repeat while (dat_77fa >= 0)
7730: 4c 4e 77                  JMP loc_774e         ; Else
7733: 20 d4 7a  loc_7733        JSR sub_7ad4         ;     Call $7ad4 [sub_7ad4]
                                                     ; End If
7736: ad 4d 19  loc_7736        LDA CurZoneFlags     ; If
7739: 29 01                     AND #$01             ;    (((CurZoneFlags & 1) | CHR_NumLights) == 0)
773b: 0d 90 63                  ORA CHR_NumLights    ;
773e: d0 08                     BNE loc_7748         ; Then
7740: a9 00                     LDA #$00             ;     Set A = 0                                 (0 = black)
7742: 20 e5 77                  JSR setAllColors     ;     Call $77e5 [setAllColors]                 (darkness)
7745: 4c 4b 77                  JMP loc_774b         ; Else
7748: 20 ee 77  loc_7748        JSR applyZoneClrs    ;     Call $77ee [applyZoneClrs]                (we can see!)
                                                     ; End If
774b: 20 56 78  loc_774b        JSR copyFrameBuf     ; Call $7856 [copyFrameBuf]
774e: a9 e5     loc_774e        LDA #$e5             ; Set
7750: 85 89                     STA dat_0089_L       ;     dat_0089_L/H
7752: a9 80                     LDA #$80             ;        =
7754: 85 8a                     STA dat_0089_H       ;          $80e5 [MoveArrowsImg]
7756: 20 f4 7e                  JSR sub_7ef4         ; Call $7ef4 [sub_7ef4]
7759: ad c0 63                  LDA INV_COMPASSES    ; If (INV_COMPASSES != 0)
775c: f0 11                     BEQ loc_776f         ; Then
775e: ad 12 63                  LDA CHR_LOC_ORIENT   ;     If
7761: cd 6a 19                  CMP CompassOrient    ;        (CHR_LOC_ORIENT != CompassOrient)
7764: f0 16                     BEQ loc_777c         ;     Then
7766: 8d 6a 19                  STA CompassOrient    ;         Set A = CompassOrient
7769: 20 c7 7e                  JSR sub_7ec7         ;         Call $7ec7 [sub_7ec7]
                                                     ;     End If
776c: 4c 7c 77                  JMP loc_777c         ; Else
776f: a9 55     loc_776f        LDA #$55             ;      If
7771: cd 6a 19                  CMP CompassOrient    ;         (CompassOrient != $55)       (player has no compasses)
7774: f0 06                     BEQ loc_777c         ; Then
7776: 8d 6a 19                  STA CompassOrient    ;     Set CompassOrient = $55
7779: 20 bc 7e                  JSR sub_7ebc         ;     Call $7ebc [sub_7ebc]
                                                     ; End If
777c: a9 89     loc_777c        LDA #$89             ; Set
777e: 8d 77 19                  STA cont_addr_1977_L ;     cont_addr_1977_L/H
7781: a9 77                     LDA #$77             ;        =
7783: 8d 78 19                  STA cont_addr_1977_H ;          $7789 [cont_7789]
7786: 4c 06 18                  JMP j_sub_2ff3       ; Call $1806 [j_sub_2ff3]
7789: a5 31     cont_7789       LDA KbdChar          ; If
778b: c9 20                     CMP #$20             ;    (KbdChar == $20 (32 ' '))         (player pressed spacebar)
778d: d0 08                     BNE loc_7797         ; Then
778f: a9 00                     LDA #$00             ;     Set
7791: 8d 33 19                  STA CurStatusPage    ;         CurStatusPage = 0            (reset to first status page)
7794: ce 5f 19                  DEC StatUpdateFlg    ;     Subtract 1 from StatUpdateFlg    (needs update)
                                                     ; End If
7797: ad c0 63  loc_7797        LDA INV_COMPASSES    ; If
779a: cd fc 77                  CMP dat_77fc         ;    (INV_COMPASSES != dat_77fc)
779d: f0 06                     BEQ loc_77a5         ; Then
779f: 8d fc 77                  STA dat_77fc         ;     Set dat_77fc = INV_COMPASSES
77a2: ce 56 19                  DEC UNK_BYTE_COUNTER ;     Subtract 1 from UNK_BYTE_COUNTER
                                                     ; End If
77a5: ad 4d 19  loc_77a5        LDA CurZoneFlags     ; If
77a8: 29 01                     AND #$01             ;    (((CurZoneFlags & 1) | CHR_NumLights)
77aa: 0d 90 63                  ORA CHR_NumLights    ;        !=
77ad: cd fb 77                  CMP dat_77fb         ;           dat_77fb)
77b0: f0 06                     BEQ loc_77b8         ; Then
77b2: 8d fb 77                  STA dat_77fb         ;     Set dat_77fb = ((CurZoneFlags & 1) | CHR_NumLights)
77b5: ce 56 19                  DEC UNK_BYTE_COUNTER ;     Subtract 1 from UNK_BYTE_COUNTER
                                                     ; End If
77b8: ad 56 19  loc_77b8        LDA UNK_BYTE_COUNTER ; If (UNK_BYTE_COUNTER != 0)
77bb: f0 08                     BEQ loc_77c5         ; Then
77bd: a9 00                     LDA #$00             ;     Set
77bf: 8d 56 19                  STA UNK_BYTE_COUNTER ;         UNK_BYTE_COUNTER = 0
77c2: 4c 33 77                  JMP loc_7733         ;     Continue @ $7733 [loc_7733]
                                                     ; End If
77c5: 20 21 18  loc_77c5        JSR j_readStick      ; Call $1821 [j_readStick]
77c8: 29 0f                     AND #$0f             ; If ((A & $f) == 0) Then           (stick is centered)
77ca: f0 b0                     BEQ loc_777c         ;     Continue @ $777c [loc_777c]
                                                     ; End If
77cc: 20 e4 7e                  JSR sub_7ee4         ; Call $7ee4 [sub_7ee4]
77cf: a9 41                     LDA #$41             ; Set
77d1: 8d 77 19                  STA cont_addr_1977_L ;     cont_addr_1977_L/H
77d4: a9 76                     LDA #$76             ;        =
77d6: 8d 78 19                  STA cont_addr_1977_H ;          $7641 [cont_7641]
77d9: a2 00                     LDX #$00             ; Set X = 0
77db: 8e 54 19                  STX dat_1954         ; Set dat_1954 = 0
77de: ca                        DEX                  ; Subtract 1 from X  (X = $ff)
77df: 8e 55 78                  STX PlayerIsMoving   ; Set PlayerIsMoving = $ff
77e2: 4c 09 18                  JMP j_loc_30e3       ; Continue @ $1809 [j_loc_30e3]

                ; Sets all wall, ceiling and floor colors to the specified value.
                ;
                ; Input
                ;   A    - Color value to apply
                ;
                ; Output
                ;   CUR_COLPF0 - Set to input value of A
                ;   CUR_COLPF1 - Set to input value of A
                ;   CUR_COLPF2 - Set to input value of A
                ;   CUR_COLBK  - Set to input value of A
                ;   COLBK_SET_18Be - Set to input value of A
                ;
77e5: a2 04     setAllColors    LDX #$04             ; Set X = 4  (5 iterations [4..0])
77e7: 9d ba 18  loc_77e7        STA CUR_COLPF0,X     ; Loop
                                                     ;     Set CUR_COLPF0[X] = A
77ea: ca                        DEX                  ;     Subtract 1 from X
77eb: 10 fa                     BPL loc_77e7         ; Repeat while (X >= 0)
77ed: 60                        RTS                  ; Return to caller

                ; Applies the current zone color values to the display
                ;
                ; Output
                ;   CUR_COLPF0  - Assigned the value of CurZneWallClr0
                ;   CUR_COLPF1  - Assigned the value of CurZneWallClr1
                ;   CUR_COLPF2  - Assigned the value of CurZneWallClr2
                ;   CUR_COLBK   - Assigned the value of CurZoneCeilClr
                ;   COLBK_SET_18Be - Assigned the value of CurZoneFlrClr
                ;
77ee: a2 04     applyZoneClrs   LDX #$04             ; Set X = 4   (5 iterations [4..0])
77f0: bd 4e 19  loc_77f0        LDA CurZneWallClr0,X ; Loop
77f3: 9d ba 18                  STA CUR_COLPF0,X     ;     Set CUR_COLPF0[X] = CurZneWallClr0[X]
77f6: ca                        DEX                  ;     Subtract 1 from X
77f7: 10 f7                     BPL loc_77f0         ; Repeat while (X >= 0)
77f9: 60                        RTS                  ; Return to caller

77fa: 00        dat_77fa        .BYTE $00            ; Loop control var
77fb: ff        dat_77fb        .BYTE $ff            ; Set to effective light level value
77fc: ff        dat_77fc        .BYTE $ff            ; Set to number of compasses held by player

77fd: 07 58 01  item_77fd       .BYTE $07,$58,$01                      ; .X.
7800: 00 00 07 00 88 ff 01 01   .BYTE $00,$00,$07,$00,$88,$ff,$01,$01  ; ........
7808: 01 00 00 00 00 01 02 80   .BYTE $01,$00,$00,$00,$00,$01,$02,$80  ; ........
7810: 01 00 10 00 c1 ff c1 ff   .BYTE $01,$00,$10,$00,$c1,$ff,$c1,$ff  ; ........
7818: 40 00 40 00 0f 92 47 00   .BYTE $40,$00,$40,$00,$0f,$92,$47,$00  ; @.@...G.
7820: 01 00 01 00 81 00 41 00   .BYTE $01,$00,$01,$00,$81,$00,$41,$00  ; ......A.
7828: 40 00 40 00 00 91 72 00   .BYTE $40,$00,$40,$00,$00,$91,$72,$00  ; @.@...r.
7830: 02 08 01 00 81 00 41 00   .BYTE $02,$08,$01,$00,$81,$00,$41,$00  ; ......A.
7838: 40 00 40 00 00 81 4a 00   .BYTE $40,$00,$40,$00,$00,$81,$4a,$00  ; @.@...J.
7840: 02 10 01 00 e1 00 41 43   .BYTE $02,$10,$01,$00,$e1,$00,$41,$43  ; ......AC
7848: 72 79 73 74 61 6c 20 44   .BYTE $72,$79,$73,$74,$61,$6c,$20,$44  ; rystal D
7850: 6f 6f 6d 00 00            .BYTE $6f,$6f,$6d,$00,$00              ; oom..

7855: 00        PlayerIsMoving  .BYTE $00            ; Flag indicating that the player is currently moving. This is set
                                                     ;     to 0 in sub_7612 and updated to $ff in cont_7641 when the
                                                     ;     joystick is not centered.

                ; Copy the working copy (frame buffer) graphic character sets to the active character sets to update
                ; the display.
                ;
                ; Temp
                ;   dat_8f77 - holds loop iteration value
                ;
7856: a2 47     copyFrameBuf    LDX #$47             ; Set X = $47   (72 iterations [71..0])
7858: 8e 77 8f  loc_7858        STX dat_8f77         ; Loop
                                                     ;     Set dat_8f77 = X
785b: bd fd 8a                  LDA dat_8afd_L,X     ;     Set
785e: 8d 76 78                  STA smc_7875+1       ;         smc_7875[1,2]
7861: bd 45 8b                  LDA dat_8afd_H,X     ;            =
7864: 8d 77 78                  STA smc_7875+2       ;              dat_8afd_L/H[X]                (source address)
7867: bd c5 7f                  LDA dat_7fc5_L,X     ;     Set
786a: 8d 7c 78                  STA smc_787b+1       ;         smc_787b[1,2]
786d: bd 0d 80                  LDA dat_7fc5_H,X     ;            =
7870: 8d 7d 78                  STA smc_787b+2       ;              dat_7fc5_L/H[X]                (destination address)
7873: a2 11                     LDX #$11             ;     Set X = $11 (18 iterations [17..0])
7875: bd ff ff  smc_7875        LDA $ffff,X          ;     Loop               (copy 18 bytes from source to destination)
7878: bc eb 8a                  LDY Mul8Tbl,X        ;         Set
787b: 99 ff ff  smc_787b        STA $ffff,Y          ;             (*(smc_787b[1]))[Mul8Tbl[X]] = (*(smc_7875[1]))[X]
787e: ca                        DEX                  ;         Subtract 1 from X
787f: 10 f4                     BPL smc_7875         ;     Repeat while (X >= 0)
7881: ae 77 8f                  LDX dat_8f77         ;     Set X = dat_8f77
7884: ca                        DEX                  ;     Subtract 1 from X
7885: 10 d1                     BPL loc_7858         ; Repeat while (X >= 0)
7887: 60                        RTS                  ; Return to caller

                ; Resets the frame buffer by initializing the 1296 bytes between $8f7b and $948b to 0.
                ;
7888: a2 d8     clearFrameBuf   LDX #$d8             ; Set X = $d8 (216 iterations [216..1])
788a: a9 00                     LDA #$00             ; Set A = 0
788c: 9d 7a 8f  loc_788c        STA FrameBuf0-1,X    ; Loop
                                                     ;     Set FrameBuf0[X - 1] = 0
788f: 9d 52 90                  STA FrameBuf1-1,X    ;     Set FrameBuf1[X - 1] = 0
7892: 9d 2a 91                  STA FrameBuf2-1,X    ;     Set FrameBuf2[X - 1] = 0
7895: 9d 02 92                  STA FrameBuf3-1,X    ;     Set FrameBuf3[X - 1] = 0
7898: 9d da 92                  STA FrameBuf4-1,X    ;     Set FrameBuf4[X - 1] = 0
789b: 9d b2 93                  STA FrameBuf5-1,X    ;     Set FrameBuf5[X - 1] = 0
789e: ca                        DEX                  ;     Subtract 1 from X
789f: d0 eb                     BNE loc_788c         ; Repeat while (X != 0)
78a1: 60                        RTS                  ; Return to caller

                ;
                ; The following 72 bytes of executable code are copied to cont_0090.
                ; Subtract $7812 from these addresses to get the corresponding ZPG addr.
                ; Several locations in the ZPG copy are updated to populate placeholders.
                ;
                ; Input
                ;   Y        - Offset from the address referenced by dat_0064
                ;   C        - initial carry value for ADC
                ;   dat_0062 - Number of iterations
                ;   dat_0064 - Index into addresses stored in dat_8afd_L/H
                ;   dat_0072_L - LSB of addr or offset?
                ;   dat_0072_H - MSB of addr or offset?
                ;   dat_0076 -
                ;   dat_0077 -
                ;   dat_007e -
                ;
                ; Before calling, the following should also be initialized:
                ;   smc_009d_L/H - address of a byte
                ;   smc_00a0     - value to AND with byte read from smc_009d_L/H
                ;   smc_00a6     - value to AND
                ;
                ; Output
                ;   dat_0062     - Will be 0
                ;   dat_0064     - Increased by the initial value of dat_0062
                ;   dat_006e     -
                ;   dat_006f     -
                ;
                ; Continues @ $79f5 [cont_79f5]
                ;
78a2: a6 64     dat_78a2        LDX dat_0064         ; Loop
                                                     ;     Set X = dat_0064
78a4: bd fd 8a                  LDA dat_8afd_L,X     ;     Set
78a7: 85 b2                     STA smc_00b2_L       ;         smc_00b2_L/H
78a9: bd 45 8b                  LDA dat_8afd_H,X     ;            =
78ac: 85 b3                     STA smc_00b2_H       ;              dat_8afd_L/H[dat_0064]
78ae: ad ff ff                  LDA $ffff            ;     Set
78b1: 29 ff                     AND #$ff             ;         A = (*smc_009d_L) & smc_00a0
78b3: aa                        TAX                  ;     Set X = A
78b4: bd 00 8e                  LDA dat_8e00,X       ;     Set smc_00b0
78b7: 29 ff                     AND #$ff             ;            =
78b9: 85 b0                     STA smc_00b0         ;              dat_8e00[A] & smc_00a6
78bb: b1 b2                     LDA (smc_00b2_L),Y   ;     If
78bd: 24 7e                     BIT dat_007e         ;        (((*smc_00b2_L)[Y] & dat_007e) != 0)
78bf: d0 05                     BNE loc_78c6         ;     Then
78c1: 09 ff                     ORA #$ff             ;         Set
78c3: 99 ff ff                  STA $ffff,Y          ;             (*smc_00b2_L)[Y] = (*smc_00b2_L)[Y] | smc_00b0
                                                     ;     End If
78c6: a5 6e     loc_78c6        LDA dat_006e         ;     Set dat_006e
78c8: 65 76                     ADC dat_0076         ;            =
78ca: 85 6e                     STA dat_006e         ;              dat_006e + dat_0076 + C  (TODO: what is C here?)
78cc: a5 77                     LDA dat_0077         ;     Set dat_006f
78ce: 65 6f                     ADC dat_006f         ;            =
78d0: 85 6f                     STA dat_006f         ;              dat_0077 + dat_006f + C
78d2: aa                        TAX                  ;     Set X = dat_006f
78d3: bd ff ff                  LDA $ffff,X          ;     Set smc_009d_L
78d6: 65 72                     ADC dat_0072_L       ;            =
78d8: 85 9d                     STA smc_009d_L       ;              (*smc_00c2_L)[X] + dat_0072_L + C
78da: bd ff ff                  LDA $ffff,X          ;     Set smc_009d_H
78dd: 65 73                     ADC dat_0072_H       ;            =
78df: 85 9e                     STA smc_009d_H       ;              $ffff[X] + dat_0072_H + C
78e1: e6 64                     INC dat_0064         ;     Add 1 to dat_0064
78e3: c6 62                     DEC dat_0062         ;     Subtract 1 from dat_0062
78e5: d0 bb                     BNE dat_78a2         ; Repeat while (dat_0062 != 0)
78e7: 4c f5 79                  JMP cont_79f5        ; Continue @ $79f5 [cont_79f5]

                ;
                ; Input
                ;   dat_1957  -
                ;   dat_0087  - Possible texture position? [0..71]?
                ;   dat_8f75  -
                ;   dat_8f7a  - Appears to be some sort of delta. Added to dat_0063 at the end of each loop iteration
                ;   dat_0063  - [0..71] Loop is exited if value is outside range.
                ;
                ;   dat_0068  -
                ;   dat_0069  -
                ;   dat_006c  - Possible fractional horizontal texture position? appears to be 8.8 fixed point
                ;   dat_006d  - Possible horizontal texture position? Set to either 0 or 71 (possibly for mirrored rendering, depending on side?)
                ;
78ea: a6 87     sub_78ea        LDX dat_0087         ; Set dat_0069
78ec: bd e5 8e                  LDA dat_8ee5,X       ;        =
78ef: 85 69                     STA dat_0069         ;          dat_8ee5[dat_0087]
78f1: bd 2d 8f                  LDA dat_8f2d,X       ; Set
78f4: 85 68                     STA dat_0068         ;     dat_0068 = dat_8f2d[dat_0087]
78f6: a9 00                     LDA #$00             ; Set
78f8: 85 6c                     STA dat_006c         ;     dat_006c = 0
78fa: 85 6d                     STA dat_006d         ; Set dat_006d = 0
78fc: 2c 7a 8f                  BIT dat_8f7a         ; If (dat_8f7a < 0)
78ff: 10 16                     BPL loc_7917         ; Then
7901: a5 69                     LDA dat_0069         ;     Set dat_0069
7903: 49 ff                     EOR #$ff             ;            =
7905: 85 69                     STA dat_0069         ;              dat_0069 xor $ff
7907: a5 68                     LDA dat_0068         ;     Set dat_0068
7909: 49 ff                     EOR #$ff             ;            =
790b: 85 68                     STA dat_0068         ;              dat_0068 xor $ff
790d: e6 68                     INC dat_0068         ;     Add 1 to dat_0068
790f: d0 02                     BNE loc_7913         ;     If (dat_0068 == 0) Then
7911: e6 69                     INC dat_0069         ;         Add 1 to dat_0069
                                                     ;     End If
7913: a9 47     loc_7913        LDA #$47             ;     Set
7915: 85 6d                     STA dat_006d         ;         dat_006d = $47 (71)
                                                     ; End If
7917: ae 75 8f  loc_7917        LDX dat_8f75         ; Set X = dat_8f75
791a: 2c 57 19                  BIT dat_1957         ; If (dat_1957 < 0)
791d: 10 0a                     BPL loc_7929         ;    And
791f: e0 05                     CPX #$05             ;    (dat_8f75 >= 5)
7921: 90 06                     BCC loc_7929         ;    And
7923: e0 07                     CPX #$07             ;    (dat_8f75 < 7)
7925: b0 02                     BCS loc_7929         ; Then
7927: ca                        DEX                  ;     Set
7928: ca                        DEX                  ;         X = dat_8f75 - 2
                                                     ; End If
7929: bd f1 96  loc_7929        LDA TexWallType_L,X  ; Set A = TexWallType_L[X]
792c: 8d 5a 79                  STA smc_7959+1       ; Set smc_7959[1] = A
792f: 18                        CLC                  ; Set dat_0070
7930: 69 48                     ADC #$48             ;        =
7932: 85 70                     STA dat_0070         ;          A + $48 (72)         (C = 1 on overflow else 0)
7934: bd 01 97                  LDA TexWallType_H,X  ; Set A = TexWallType_H[X]
7937: 8d 5b 79                  STA smc_7959+2       ; Set smc_7959[2] = A
793a: 69 00                     ADC #$00             ; Set
793c: 85 71                     STA dat_0071         ;     dat_0071 = A + C
793e: a6 63     loc_793e        LDX dat_0063         ; Loop
7940: 10 03                     BPL loc_7945         ;     Set X = dat_0063
7942: 4c 1e 7a                  JMP loc_7a1e         ;     If (X < 0)
7945: e0 48     loc_7945        CPX #$48             ;        Or (X >= $48 (72))
7947: 90 03                     BCC loc_794c         ;     Then
7949: 4c 1e 7a                  JMP loc_7a1e         ;         Exit Loop
                                                     ;     End If
794c: bd 8b 94  loc_794c        LDA dat_948b,X       ;     If
794f: 10 03                     BPL loc_7954         ;        (dat_948b[X] >= 0)
7951: 4c f5 79                  JMP cont_79f5        ;     Then
7954: a4 6d     loc_7954        LDY dat_006d         ;         Set Y = dat_006d
7956: bd 8b 94                  LDA dat_948b,X       ;         Set dat_948b[X]
7959: 19 ff ff  smc_7959        ORA $ffff,Y          ;                =
795c: 9d 8b 94                  STA dat_948b,X       ;                  dat_948b[X] | (*smc_7959[1])[Y]
795f: 10 02                     BPL loc_7963         ;         If (dat_948b[X] < 0) Then
7961: e6 88                     INC dat_0088         ;             Add 1 to dat_0088
                                                     ;         End If
7963: 8a        loc_7963        TXA                  ;         Set Y
7964: 29 03                     AND #$03             ;               =
7966: a8                        TAY                  ;                 X & 3
7967: b9 8d 8b                  LDA dat_8b8d,Y       ;         Set A = dat_8b8d[Y]
796a: 85 a6                     STA smc_00a6         ;         Set smc_00a6 = A
796c: 85 7e                     STA dat_007e         ;         Set dat_007e = A
796e: 8a                        TXA                  ;         Set
796f: 4a                        LSR                  ;             smc_79ef[1]
7970: 4a                        LSR                  ;                =
7971: 8d f0 79                  STA smc_79ef+1       ;                  X >> 2
7974: a9 00                     LDA #$00             ;         Set
7976: 85 6e                     STA dat_006e         ;             dat_006e = 0
7978: 85 6f                     STA dat_006f         ;         Set dat_006f = 0
797a: 38                        SEC                  ;         Set
797b: a9 23                     LDA #$23             ;             dat_0064
797d: e5 67                     SBC dat_0067         ;                =
797f: 85 64                     STA dat_0064         ;                  $23 (35) - dat_0067  (C = 0 on underflow else 1)
7981: a5 67                     LDA dat_0067         ;         Set A = dat_0067
7983: aa                        TAX                  ;         Set X = A
7984: 69 00                     ADC #$00             ;         Set dat_0062
7986: 0a                        ASL                  ;                =
7987: 85 62                     STA dat_0062         ;                  A - C
7989: a5 6d                     LDA dat_006d         ;         Set
798b: 85 65                     STA dat_0065         ;             dat_0065 = dat_006d
798d: bd 81 8e                  LDA dat_8e81,X       ;         Set
7990: 85 76                     STA dat_0076         ;             dat_0076 = dat_8e81[X]
7992: bd 41 8e                  LDA dat_8e41,X       ;         Set
7995: 85 77                     STA dat_0077         ;             dat_0077 = dat_8e41[X]
7997: bc c1 8e                  LDY dat_8ec1,X       ;         Set Y = dat_8ec1[X]
799a: 8c 76 8f                  STY dat_8f76         ;         Set dat_8f76 = Y
799d: b9 9b 8b                  LDA dat_8b9b,Y       ;         Set
79a0: 85 c2                     STA smc_00c2_L       ;             smc_00c2_L/H
79a2: b9 9e 8b                  LDA dat_8b9e,Y       ;                =
79a5: 85 c3                     STA smc_00c2_H       ;                  dat_8b9b[Y]/dat_8b9e[Y]
79a7: b9 a1 8b                  LDA dat_8ba1,Y       ;         Set
79aa: 85 c9                     STA smc_00c9_L       ;             smc_00c9_L/H
79ac: b9 a4 8b                  LDA dat_8ba4,Y       ;                =
79af: 85 ca                     STA smc_00c9_H       ;                  dat_8ba1[Y]/dat_8ba4[Y]
79b1: c0 00                     CPY #$00             ;     If (Y != 0)
79b3: f0 05                     BEQ loc_79ba         ;     Then
79b5: 46 65     loc_79b5        LSR dat_0065         ;         Loop
                                                     ;             Set dat_0065 = dat_0065 / 2
79b7: 88                        DEY                  ;             Subtract 1 from Y
79b8: d0 fb                     BNE loc_79b5         ;         Repeat while (Y != 0)
                                                     ;     End If
79ba: a5 65     loc_79ba        LDA dat_0065         ;     Set X
79bc: 29 03                     AND #$03             ;           =
79be: aa                        TAX                  ;             dat_0065 & 3
79bf: bd 8d 8b                  LDA dat_8b8d,X       ;     Set
79c2: 85 a0                     STA dat_00a0         ;         dat_00a0 = dat_8b8d[X]
79c4: a5 65                     LDA dat_0065         ;     Set
79c6: 4a                        LSR                  ;         smc_79df[1]
79c7: 4a                        LSR                  ;            =
79c8: 8d e0 79                  STA smc_79df+1       ;              dat_0065 / 4
79cb: ae 76 8f                  LDX dat_8f76         ;     Set X = dat_8f76
79ce: 18                        CLC                  ;     Set
79cf: a5 70                     LDA dat_0070         ;         smc_009d_L
79d1: 7d 95 8b                  ADC dat_8b95,X       ;            =
79d4: 85 9d                     STA smc_009d_L       ;              dat_0070 + dat_8b95[X]    (C = 1 on overflow else 0)
79d6: a5 71                     LDA dat_0071         ;     Set smc_009d_H
79d8: 7d 98 8b                  ADC dat_8b98,X       ;            =
79db: 85 9e                     STA smc_009d_H       ;              dat_0071 + dat_8b98[X] + C       (C = 1 on overflow)
79dd: a5 9d                     LDA smc_009d_L       ;     Set smc_009d_L
79df: 69 ff     smc_79df        ADC #$ff             ;            =
79e1: 85 9d                     STA smc_009d_L       ;              smc_009d_L + smc_79df[1] + C     (C = 1 on overflow)
79e3: 90 02                     BCC loc_79e7         ;     If (C == 1) Then
79e5: e6 9e                     INC smc_009d_H       ;         Add 1 to smc_009d_H
                                                     ;     End If
79e7: a5 9d     loc_79e7        LDA smc_009d_L       ;     Set
79e9: 85 72                     STA dat_0072_L       ;         dat_0072_L/H
79eb: a5 9e                     LDA smc_009d_H       ;            =
79ed: 85 73                     STA dat_0072_H       ;              smc_009d_L/H
79ef: a0 ff     smc_79ef        LDY #$ff             ;     Set Y = smc_79ef[1]
79f1: 18                        CLC                  ;     Set C = 0
79f2: 4c 90 00                  JMP cont_0090        ;     Continue @ $0090 [cont_0090]    (returns @ next op when done)
79f5: 18        cont_79f5       CLC                  ;     Set
79f6: a5 66                     LDA dat_0066         ;         dat_0066
79f8: 65 6a                     ADC dat_006a         ;            =
79fa: 85 66                     STA dat_0066         ;              dat_0066 + dat_006a       (C = 1 on overflow else 0)
79fc: a5 67                     LDA dat_0067         ;     Set dat_0067
79fe: 65 6b                     ADC dat_006b         ;            =
7a00: 85 67                     STA dat_0067         ;              dat_0067 + dat_006b + C
7a02: 18                        CLC                  ;     Set
7a03: a5 63                     LDA dat_0063         ;         dat_0063
7a05: 6d 7a 8f                  ADC dat_8f7a         ;            =
7a08: 85 63                     STA dat_0063         ;              dat_0063 + dat_8f7a
7a0a: 18                        CLC                  ;     Set
7a0b: a5 6c                     LDA dat_006c         ;         dat_006c
7a0d: 65 68                     ADC dat_0068         ;            =
7a0f: 85 6c                     STA dat_006c         ;              dat_006c + dat_0068       (C = 1 on overflow else 0)
7a11: a5 6d                     LDA dat_006d         ;     Set dat_006d
7a13: 65 69                     ADC dat_0069         ;            =
7a15: 85 6d                     STA dat_006d         ;              dat_006d + dat_0069 + C
7a17: c9 48                     CMP #$48             ; Repeat
7a19: b0 03                     BCS loc_7a1e         ;    while
7a1b: 4c 3e 79                  JMP loc_793e         ;      (dat_006d < $48 (72))
7a1e: 60        loc_7a1e        RTS                  ; Return to caller

                ;
                ;
                ;
7a1f: a9 00     sub_7a1f        LDA #$00             ; Set A = 0
7a21: 85 7a                     STA dat_007a         ; Set dat_007a = 0
7a23: a2 08                     LDX #$08             ; Set X = 8
7a25: 0a        loc_7a25        ASL                  ; Loop
                                                     ;     Set A = A << 1                           (C = old bit 7 of A)
7a26: 26 7a                     ROL dat_007a         ;     Set dat_007a = (dat_007a << 1) | C
7a28: 06 79                     ASL dat_0079         ;     Set dat_0079 = dat_0079 << 1      (C = old bit 7 of dat_0079)
7a2a: 90 07                     BCC loc_7a33         ;     If (C == 1) Then
7a2c: 18                        CLC                  ;         Set
7a2d: 65 78                     ADC dat_0078         ;             A = A + dat_0078           (C = 1 on overflow else 0)
7a2f: 90 02                     BCC loc_7a33         ;         If (C == 1) Then
7a31: e6 7a                     INC dat_007a         ;             Add 1 to dat_007a
                                                     ;         End If
                                                     ;     End If
7a33: ca        loc_7a33        DEX                  ;     Subtract 1 from X
7a34: d0 ef                     BNE loc_7a25         ; Repeat while (X != 0)
7a36: 60                        RTS                  ; Return to caller

                ;
                ; Input
                ;   CHR_LOC_X     - Player's current horizontal map position
                ;   CHR_LOC_Y     - Player's current vertical map position
                ;
                ; Temp
                ;   dat_007b_L/H  - Holds the address of a map cell byte related to the player's current position
                ;                   and orientation. Initially calculated as the address of the map cell the player is
                ;                   in, plus the offset in dat_7acc_L/H corresponding to the player's orientation.
                ;   dat_007d      - Loop control var
                ;   smc_7a99[1]   - Set to dat_7abc_L[CHR_LOC_ORIENT]
                ;   smc_7a9f[1]   - Set to dat_7ac0_H[CHR_LOC_ORIENT]
                ;   smc_7aaa[1]   - Set to dat_7ac4_L[CHR_LOC_ORIENT]
                ;   smc_7ab0[1]   - Set to dat_7ac4_H[CHR_LOC_ORIENT]
                ;
7a37: ae 12 63  sub_7a37        LDX CHR_LOC_ORIENT   ; Set X = CHR_LOC_ORIENT
7a3a: bd bc 7a                  LDA dat_7abc_L,X     ; Set
7a3d: 8d 9a 7a                  STA smc_7a99+1       ;     smc_7a99[1] = dat_7abc_L[X]
7a40: bd c0 7a                  LDA dat_7ac0_H,X     ; Set
7a43: 8d a0 7a                  STA smc_7a9f+1       ;     smc_7a9f[1] = dat_7ac0_H[X]
7a46: bd c4 7a                  LDA dat_7ac4_L,X     ; Set
7a49: 8d ab 7a                  STA smc_7aaa+1       ;     smc_7aaa[1] = dat_7ac4_L[X]
7a4c: bd c8 7a                  LDA dat_7ac4_H,X     ; Set
7a4f: 8d b1 7a                  STA smc_7ab0+1       ;     smc_7ab0[1] = dat_7ac4_H[X]
7a52: a9 00                     LDA #$00             ; Set
7a54: 85 7b                     STA dat_007b_L       ;     dat_007b_L = 0
7a56: ad 14 63                  LDA CHR_LOC_Y        ; Set dat_007b_H
7a59: 4a                        LSR                  ;        =
7a5a: 85 7c                     STA dat_007b_H       ;          CHR_LOC_Y >> 1
7a5c: 66 7b                     ROR dat_007b_L       ; Set
7a5e: ad 13 63                  LDA CHR_LOC_X        ;     dat_007b_L
7a61: 0a                        ASL                  ;        =
7a62: 0a                        ASL                  ;          (CHR_LOC_Y & 1) << 7          (128 bytes per map row)
7a63: 05 7b                     ORA dat_007b_L       ;          |
7a65: 18                        CLC                  ;          (CHR_LOC_X << 2)              (4 bytes per map cell)
7a66: 7d cc 7a                  ADC dat_7acc_L,X     ;          +                             (add offset to wall byte)
7a69: 85 7b                     STA dat_007b_L       ;          dat_7acc_L[X]                 (C = 1 on overflow else 0)
7a6b: a5 7c                     LDA dat_007b_H       ; Set
7a6d: 7d d0 7a                  ADC dat_7acc_H,X     ;     dat_007b_H
7a70: 18                        CLC                  ;        =
7a71: 69 b0                     ADC #$b0             ;          dat_007b_H + dat_7acc_H[X] +
7a73: 85 7c                     STA dat_007b_H       ;            C + $b0              (start of map cell data is $b000)
7a75: a0 00                     LDY #$00             ; Set Y = 0
7a77: a2 09                     LDX #$09             ; Set X = 9                       (10 iterations [9..0])
7a79: 86 7d                     STX dat_007d         ; Set dat_007d = X
7a7b: bd a3 8c  loc_7a7b        LDA dat_8ca3_L,X     ; Loop
7a7e: 8d 8e 7a                  STA smc_7a8d+1       ;     Set smc_7a8d[1] = dat_8ca3_L[X]
7a81: bd ad 8c                  LDA dat_8ca3_H,X     ;     Set
7a84: 8d 8f 7a                  STA smc_7a8d+2       ;         smc_7a8d[2] = dat_8ca3_H[X]
7a87: a2 00                     LDX #$00             ;     Set X = 0                   (11 iterations @ step 4)
7a89: a0 00     loc_7a89        LDY #$00             ;     Loop
                                                     ;         Set Y = 0               (4 iterations [0..3])
7a8b: b1 7b     loc_7a8b        LDA (dat_007b_L),Y   ;         Loop                    (copy cell data)
7a8d: 9d ff ff  smc_7a8d        STA $ffff,X          ;             Set (*smc_7a8d[1])[X] = (*dat_007b_L)[Y]
7a90: e8                        INX                  ;             Add 1 to X
7a91: c8                        INY                  ;             Add 1 to Y
7a92: c0 04                     CPY #$04             ;         Repeat
7a94: d0 f5                     BNE loc_7a8b         ;            while (Y != 4)
7a96: a5 7b                     LDA dat_007b_L       ;         Set
7a98: 18                        CLC                  ;             dat_007b_L
7a99: 69 ff     smc_7a99        ADC #$ff             ;                =                       (C = 1 on overflow else 0)
7a9b: 85 7b                     STA dat_007b_L       ;                  dat_007b_L + smc_7a99[1]
7a9d: a5 7c                     LDA dat_007b_H       ;         Set dat_007b_H
7a9f: 69 ff     smc_7a9f        ADC #$ff             ;                =
7aa1: 85 7c                     STA dat_007b_H       ;                  dat_007b_H + smc_7a9f[1] + C
7aa3: e0 2c                     CPX #$2c             ;     Repeat
7aa5: 90 e2                     BCC loc_7a89         ;        while (X < $2c (44))
7aa7: a5 7b                     LDA dat_007b_L       ;     Set                              (Move to next relevant cell)
7aa9: 18                        CLC                  ;         dat_007b_L
7aaa: 69 ff     smc_7aaa        ADC #$ff             ;            =
7aac: 85 7b                     STA dat_007b_L       ;              dat_007b_L + smc_7aaa[1]  (C = 1 on overflow else 0)
7aae: a5 7c                     LDA dat_007b_H       ;     Set dat_007b_H
7ab0: 69 ff     smc_7ab0        ADC #$ff             ;            =
7ab2: 85 7c                     STA dat_007b_H       ;              dat_007b_H + smc_7ab0[1] + C
7ab4: a6 7d                     LDX dat_007d         ;     Set
7ab6: ca                        DEX                  ;         X = dat_007d - 1
7ab7: 86 7d                     STX dat_007d         ;     Set dat_007d = X
7ab9: 10 c0                     BPL loc_7a7b         ; Repeat while (X >= 0)
7abb: 60                        RTS                  ; Return to caller

7abc: 04 80 fc  dat_7abc_L      .BYTE $04,$80,$fc    ; Amounts to use for ADC operand @ smc_7a99 based on orientation
7abf: 80                        .BYTE $80            ; The value is added to dat_007b_L

7ac0: 00 00 ff  dat_7ac0_H      .BYTE $00,$00,$ff    ; Amounts to use for ADC operand @ smc_7a9f based on orientation
7ac3: ff                        .BYTE $ff            ; The value is added to dat_007b_H

7ac4: 54 7c ac  dat_7ac4_L      .BYTE $54,$7c,$ac    ; Amounts to use for ADC operand @ smc_7aaa based on orientation
7ac7: 84                        .BYTE $84            ; The value is added to dat_007b_L and appears to be a step amount
                                                     ; to add per iteration.

7ac8: 00 fa ff  dat_7ac4_H      .BYTE $00,$fa,$ff    ; Amounts to use for ADC operand @ smc_7ab0 based on orientation
7acb: 05                        .BYTE $05            ; The value is added to dat_007b_H and appears to be a step amount
                                                     ; to add per iteration.

7acc: 6c a4 94  dat_7acc_L      .BYTE $6c,$a4,$94    ; Offsets to include in the initial calculation of the map cell
7acf: 5c                        .BYTE $5c            ; address initially placed into dat_007b_L based on orientation.

7ad0: fb fd 04  dat_7acc_H      .BYTE $fb,$fd,$04    ; Offsets to include in the initial calculation of the map cell
7ad3: 02                        .BYTE $02            ; address initially placed into dat_007b_H based on orientation.

                ;
                ;
                ;
7ad4: 20 88 78  sub_7ad4        JSR clearFrameBuf    ; Call $7888 [clearFrameBuf]
7ad7: a2 47                     LDX #$47             ; Set X = $47 (72 iterations [71..0])
7ad9: a9 00                     LDA #$00             ; Set A = 0
7adb: 9d 8b 94  loc_7adb        STA dat_948b,X       ; Loop
                                                     ;     Set dat_948b[X] = 0
7ade: ca                        DEX                  ;     Subtract 1 from X
7adf: 10 fa                     BPL loc_7adb         ; Repeat while (X >= 0)
7ae1: 85 88                     STA dat_0088         ; Set dat_0088 = 0
7ae3: ae 12 63                  LDX CHR_LOC_ORIENT   ; Set X = CHR_LOC_ORIENT
7ae6: bd cb 8d                  LDA dat_8dcb,X       ; Set
7ae9: 8d e0 7d                  STA dat_7de0         ;     dat_7de0 = dat_8dcb[X]                    (wall type bitmask)
7aec: bd d1 8d                  LDA dat_8dd1,X       ; Set
7aef: 8d e1 7d                  STA dat_7de1         ;     dat_7de1 = dat_8dd1[X]
7af2: bd cc 8d                  LDA dat_8dcc,X       ; Set
7af5: 8d de 7d                  STA dat_7dde         ;     dat_7dde = dat_8dcc[X]                    (wall type bitmask)
7af8: bd d0 8d                  LDA dat_8dd0,X       ; Set
7afb: 8d e3 7d                  STA dat_7de3         ;     dat_7de3 = dat_8dd0[X]
7afe: bd cc 8d                  LDA dat_8dcc,X       ; Set
7b01: 8d df 7d                  STA dat_7ddf         ;     dat_7ddf = dat_8dcc[X]                    (wall type bitmask)
7b04: bd d2 8d                  LDA dat_8dd2,X       ; Set
7b07: 8d e2 7d                  STA dat_7de2         ;     dat_7de2 = dat_8dd2[X]
7b0a: bc e4 7d                  LDY dat_7de4,X       ; Set Y = dat_7de4[X]
7b0d: b9 16 63                  LDA CHR_FRAC_LOC_X,Y ; Set A
7b10: 18                        CLC                  ;       =
7b11: 7d e8 7d                  ADC dat_7de8,X       ;         CHR_FRAC_LOC_X[Y] + dat_7de8[X]
7b14: 10 05                     BPL loc_7b1b         ; If (A < 0) Then
7b16: 49 ff                     EOR #$ff             ;     Set A
7b18: 18                        CLC                  ;           =
7b19: 69 01                     ADC #$01             ;             (A xor $ff) + 1
                                                     ; End If
7b1b: 85 7f     loc_7b1b        STA dat_007f         ; Set dat_007f = A
7b1d: a2 00                     LDX #$00             ; Set X = 0          (10 iterations [0..9])
7b1f: 86 80     loc_7b1f        STX dat_0080         ; Loop
                                                     ;     Set dat_0080 = X
7b21: a5 88                     LDA dat_0088         ;     If
7b23: c9 48                     CMP #$48             ;        (dat_0088 >= $48 (72))
7b25: 90 03                     BCC loc_7b2a         ;     Then
7b27: 4c dd 7d                  JMP loc_7ddd         ;         Exit Loop
                                                     ;     End If
7b2a: bd a3 8c  loc_7b2a        LDA dat_8ca3_L,X     ;     Set
7b2d: 85 7b                     STA dat_007b_L       ;         dat_007b_L/H
7b2f: bd ad 8c                  LDA dat_8ca3_H,X     ;            =
7b32: 85 7c                     STA dat_007b_H       ;              dat_8ca3_L/H[X]
7b34: bd b7 8c                  LDA dat_8cb7,X       ;     Set
7b37: 8d 77 8f                  STA dat_8f77         ;         dat_8f77 = dat_8cb7[X]        (number of loop iterations)
7b3a: a9 ff                     LDA #$ff             ;     Set
7b3c: 8d 7a 8f                  STA dat_8f7a         ;         dat_8f7a = $ff
7b3f: a9 05                     LDA #$05             ;     Set
7b41: 85 7d                     STA dat_007d         ;         dat_007d = 5   (5 .. 5-dat_8f77)
7b43: a5 7d     loc_7b43        LDA dat_007d         ;     Loop
7b45: 0a                        ASL                  ;         Set
7b46: 0a                        ASL                  ;             Y
7b47: 0d e3 7d                  ORA dat_7de3         ;               =
7b4a: a8                        TAY                  ;                 (dat_007d * 4) | dat_7de3
7b4b: b1 7b                     LDA (dat_007b_L),Y   ;         Set                    (get wall type byte and mask bits)
7b4d: 2d de 7d                  AND dat_7dde         ;             A = (*dat_007b_L)[Y] & dat_7dde
7b50: d0 03                     BNE loc_7b55         ;         If (A != 0)                  (at least one wall is non-0)
7b52: 4c b7 7b                  JMP loc_7bb7         ;         Then
7b55: 2c de 7d  loc_7b55        BIT dat_7dde         ;             If (dat_7dde < 0)  (type in high nibble, shift right)
7b58: 10 04                     BPL loc_7b5e         ;             Then
7b5a: 4a                        LSR                  ;                 Set
7b5b: 4a                        LSR                  ;                     A
7b5c: 4a                        LSR                  ;                       =
7b5d: 4a                        LSR                  ;                         A >> 4
                                                     ;             End If
7b5e: 8d 75 8f  loc_7b5e        STA dat_8f75         ;             Set dat_8f75 = A              (A = wall type (0..15))
7b61: a4 7d                     LDY dat_007d         ;             Set Y = dat_007d
7b63: b9 d7 8c                  LDA dat_8cd7,Y       ;             Set
7b66: 85 81                     STA dat_0081         ;                 dat_0081 = dat_8cd7[Y]
7b68: b9 e2 8c                  LDA dat_8ce2,Y       ;             Set
7b6b: 85 82                     STA dat_0082         ;                 dat_0082 = dat_8ce2[Y]
7b6d: b9 2f 8d                  LDA dat_8d2f,Y       ;             Set
7b70: 85 83                     STA dat_0083         ;                 dat_0083 = dat_8d2f[Y]
7b72: b9 35 8d                  LDA dat_8d35,Y       ;             Set
7b75: 85 84                     STA dat_0084         ;                 dat_0084 = dat_8d35[Y]
7b77: a4 80                     LDY dat_0080         ;             Set Y = dat_0080
7b79: c8                        INY                  ;             Add 1 to Y
7b7a: 20 0d 7e                  JSR sub_7e0d         ;             Call $7e0d [sub_7e0d]
7b7d: c9 48                     CMP #$48             ;             If (A < $48 (72))
7b7f: b0 36                     BCS loc_7bb7         ;             Then
7b81: e9 00                     SBC #$00             ;                 Set A = A - C
7b83: 85 85                     STA dat_0085         ;                 Set dat_0085 = A
7b85: 85 63                     STA dat_0063         ;                 Set dat_0063 = A
7b87: 88                        DEY                  ;                 Subtract 1 from Y
7b88: 20 0d 7e                  JSR sub_7e0d         ;                 Call $7e0d [sub_7e0d]
7b8b: 85 86                     STA dat_0086         ;                 Set dat_0086 = A
7b8d: a5 85                     LDA dat_0085         ;                 Set
7b8f: 38                        SEC                  ;                     dat_0087
7b90: e5 86                     SBC dat_0086         ;                        =
7b92: 85 87                     STA dat_0087         ;                          dat_0085 - dat_0086
7b94: a4 7d                     LDY dat_007d         ;                 Set Y = dat_007d
7b96: b9 c1 8c                  LDA dat_8cc1,Y       ;                 Set
7b99: 85 6b                     STA dat_006b         ;                     dat_006b = dat_8cc1[Y]
7b9b: a9 23                     LDA #$23             ;                 Set A
7b9d: 38                        SEC                  ;                       =
7b9e: e5 63                     SBC dat_0063         ;                         $23 (35) - dat_0063
7ba0: be cc 8c                  LDX dat_8ccc,Y       ;                 Set X = dat_8ccc[Y]
7ba3: 86 6a                     STX dat_006a         ;                 Set dat_006a = X
7ba5: f0 0b                     BEQ loc_7bb2         ;                 If (X != 0) Then
7ba7: 86 78                     STX dat_0078         ;                     Set dat_0078 = X
7ba9: 85 79                     STA dat_0079         ;                     Set dat_0079 = A
7bab: 20 1f 7a                  JSR sub_7a1f         ;                     Call $7a1f [sub_7a1f]
7bae: 85 66                     STA dat_0066         ;                     Set dat_0066 = A
7bb0: a5 7a                     LDA dat_007a         ;                     Set A = dat_007a
                                                     ;                 End If
7bb2: 85 67     loc_7bb2        STA dat_0067         ;                 Set dat_0067 = A
7bb4: 20 ea 78                  JSR sub_78ea         ;             End If
                                                     ;         End If
7bb7: c6 7d     loc_7bb7        DEC dat_007d         ;         Subtract 1 from dat_007d
7bb9: ce 77 8f                  DEC dat_8f77         ;         Subtract 1 from dat_8f77
7bbc: 30 03                     BMI loc_7bc1         ;     Repeat
7bbe: 4c 43 7b                  JMP loc_7b43         ;        while (dat_8f77 >= 0) Then
7bc1: a6 80     loc_7bc1        LDX dat_0080         ;     Set X = dat_0080
7bc3: bd b7 8c                  LDA dat_8cb7,X       ;     Set
7bc6: 8d 77 8f                  STA dat_8f77         ;         dat_8f77 = dat_8cb7[X]
7bc9: a9 01                     LDA #$01             ;     Set
7bcb: 8d 7a 8f                  STA dat_8f7a         ;         dat_8f7a = 1
7bce: a9 05                     LDA #$05             ;     Set
7bd0: 85 7d                     STA dat_007d         ;         dat_007d = 5
7bd2: a5 7d     loc_7bd2        LDA dat_007d         ;     Loop
                                                     ;         Set
7bd4: 0a                        ASL                  ;             Y
7bd5: 0a                        ASL                  ;               =
7bd6: 0d e2 7d                  ORA dat_7de2         ;                 (dat_007d << 2) | dat_7de2
7bd9: a8                        TAY                  ;                 .
7bda: b1 7b                     LDA (dat_007b_L),Y   ;         Set                    (get wall type byte and mask bits)
7bdc: 2d df 7d                  AND dat_7ddf         ;             A = (*dat_007b_L)[Y] & dat_7ddf
7bdf: d0 03                     BNE loc_7be4         ;         If (A != 0)                  (at least one wall is non-0)
7be1: 4c 42 7c                  JMP loc_7c42         ;         Then
7be4: 2c df 7d  loc_7be4        BIT dat_7ddf         ;             If
7be7: 10 04                     BPL loc_7bed         ;                (dat_7ddf < 0)  (type in high nibble, shift right)
7be9: 4a                        LSR                  ;             Then
7bea: 4a                        LSR                  ;                 Set A
7beb: 4a                        LSR                  ;                       =
7bec: 4a                        LSR                  ;                         A >> 4
                                                     ;             End If
7bed: 8d 75 8f  loc_7bed        STA dat_8f75         ;             Set dat_8f75 = A              (A = wall type (0..15))
7bf0: a4 7d                     LDY dat_007d         ;             Set Y = dat_007d
7bf2: b9 d7 8c                  LDA dat_8cd7,Y       ;             Set
7bf5: 85 81                     STA dat_0081         ;                 dat_0081 = dat_8cd7[Y]
7bf7: b9 e2 8c                  LDA dat_8ce2,Y       ;             Set
7bfa: 85 82                     STA dat_0082         ;                 dat_0082 = dat_8ce2[Y]
7bfc: b9 78 8d                  LDA dat_8d78,Y       ;             Set
7bff: 85 83                     STA dat_0083         ;                 dat_0083 = dat_8d78[Y]
7c01: b9 7e 8d                  LDA dat_8d7e,Y       ;             Set
7c04: 85 84                     STA dat_0084         ;                 dat_0084 = dat_8d7e[Y]
7c06: a4 80                     LDY dat_0080         ;             Set
7c08: c8                        INY                  ;                 Y = dat_0080 + 1
7c09: 20 2d 7e                  JSR sub_7e2d         ;             Call $7e2d [sub_7e2d]
7c0c: c9 48                     CMP #$48             ;             If (A < $48 (72))
7c0e: b0 32                     BCS loc_7c42         ;             Then
7c10: 85 85                     STA dat_0085         ;                 Set dat_0085 = A
7c12: 85 63                     STA dat_0063         ;                 Set dat_0063 = A
7c14: 88                        DEY                  ;                 Subtract 1 from Y
7c15: 20 2d 7e                  JSR sub_7e2d         ;                 Call $7e2d [sub_7e2d]
7c18: 85 86                     STA dat_0086         ;                 Set dat_0086 = A
7c1a: 18                        CLC                  ;                 Set dat_0087
7c1b: e5 85                     SBC dat_0085         ;                        =
7c1d: 85 87                     STA dat_0087         ;                          A - dat_0085
7c1f: a4 7d                     LDY dat_007d         ;                 Set Y = dat_007d
7c21: b9 c1 8c                  LDA dat_8cc1,Y       ;                 Set
7c24: 85 6b                     STA dat_006b         ;                     dat_006b = dat_8cc1[Y]
7c26: a5 63                     LDA dat_0063         ;                 Set A
7c28: 38                        SEC                  ;                       =
7c29: e9 24                     SBC #$24             ;                         dat_0063 - $24 (36)
7c2b: be cc 8c                  LDX dat_8ccc,Y       ;                 Set X = dat_8ccc[Y]
7c2e: 86 6a                     STX dat_006a         ;                 Set dat_006a = X
7c30: f0 0b                     BEQ loc_7c3d         ;                 If (dat_006a != 0) Then
7c32: 86 78                     STX dat_0078         ;                     Set dat_0078 = X
7c34: 85 79                     STA dat_0079         ;                     Set dat_0079 = A
7c36: 20 1f 7a                  JSR sub_7a1f         ;                     Call $7a1f [sub_7a1f]
7c39: 85 66                     STA dat_0066         ;                     Set dat_0066 = A
7c3b: a5 7a                     LDA dat_007a         ;                     Set A = dat_007a
                                                     ;                 End If
7c3d: 85 67     loc_7c3d        STA dat_0067         ;                 Set dat_0067 = A
7c3f: 20 ea 78                  JSR sub_78ea         ;                 Call $78ea [sub_78ea]
                                                     ;             End If
                                                     ;         End If
7c42: e6 7d     loc_7c42        INC dat_007d         ;         Add 1 to dat_007d
7c44: ce 77 8f                  DEC dat_8f77         ;         Subtract 1 from dat_8f77
7c47: 30 03                     BMI loc_7c4c         ;     Repeat
7c49: 4c d2 7b                  JMP loc_7bd2         ;        while (dat_8f77 >= 0)
7c4c: a9 14     loc_7c4c        LDA #$14             ;     Set Y
7c4e: 0d e1 7d                  ORA dat_7de1         ;           =
7c51: a8                        TAY                  ;             $14 | dat_7de1
7c52: b1 7b                     LDA (dat_007b_L),Y   ;     Set                        (get wall type byte and mask bits)
7c54: 2d e0 7d                  AND dat_7de0         ;         A = (*dat_007b_L)[Y] & dat_7de0
7c57: d0 03                     BNE loc_7c5c         ;     If (A != 0)                      (at least one wall is non-0)
7c59: 4c ab 7c                  JMP loc_7cab         ;     Then
7c5c: 2c e0 7d  loc_7c5c        BIT dat_7de0         ;         If (dat_7de0 < 0)      (type in high nibble, shift right)
7c5f: 10 04                     BPL loc_7c65         ;         Then
7c61: 4a                        LSR                  ;             Set
7c62: 4a                        LSR                  ;                 A
7c63: 4a                        LSR                  ;                   =
7c64: 4a                        LSR                  ;                     A >> 4
                                                     ;         End If
7c65: 8d 75 8f  loc_7c65        STA dat_8f75         ;         Set dat_8f75 = A                  (A = wall type (0..15))
7c68: a9 72                     LDA #$72             ;         Set
7c6a: 85 83                     STA dat_0083         ;             dat_0083 = $72 (114)
7c6c: a9 8d                     LDA #$8d             ;         Set
7c6e: 85 84                     STA dat_0084         ;             dat_0084 = $8d (141)
7c70: a9 24                     LDA #$24             ;         Set
7c72: 85 81                     STA dat_0081         ;             dat_0081 = $24 (36)
7c74: a9 8d                     LDA #$8d             ;         Set
7c76: 85 82                     STA dat_0082         ;             dat_0082 = $8d (141)
7c78: a4 80                     LDY dat_0080         ;         Set
7c7a: c8                        INY                  ;             Y = dat_0080 + 1
7c7b: 20 0d 7e                  JSR sub_7e0d         ;         Call $7e0d [sub_7e0d]
7c7e: 85 63                     STA dat_0063         ;         Set dat_0063 = A
7c80: 85 85                     STA dat_0085         ;         Set dat_0085 = A
7c82: a9 89                     LDA #$89             ;         Set
7c84: 85 83                     STA dat_0083         ;             dat_0083 = $89 (137)
7c86: a9 8d                     LDA #$8d             ;         Set
7c88: 85 84                     STA dat_0084         ;             dat_0084 = $8d (141)
7c8a: a4 80                     LDY dat_0080         ;         Set
7c8c: c8                        INY                  ;             Y = dat_0080 + 1
7c8d: 20 2d 7e                  JSR sub_7e2d         ;         Call $7e2d [sub_7e2d]
7c90: 38                        SEC                  ;         Set
7c91: e9 01                     SBC #$01             ;             A = A - 1
7c93: 85 86                     STA dat_0086         ;         Set dat_0086 = A
7c95: 38                        SEC                  ;         Set dat_0087
7c96: e5 85                     SBC dat_0085         ;                =
7c98: 85 87                     STA dat_0087         ;                  A - dat_0085
7c9a: a9 00                     LDA #$00             ;         Set
7c9c: 85 6a                     STA dat_006a         ;             dat_006a = 0
7c9e: 85 6b                     STA dat_006b         ;         Set dat_006b = 0
7ca0: a4 80                     LDY dat_0080         ;         Set
7ca2: c8                        INY                  ;             Y = dat_0080 + 1
7ca3: 20 ec 7d                  JSR sub_7dec         ;         Call $7dec [sub_7dec]
7ca6: 85 67                     STA dat_0067         ;         Set dat_0067 = A
7ca8: 20 ea 78                  JSR sub_78ea         ;         Call $78ea [sub_78ea]
                                                     ;     End If
7cab: a6 80     loc_7cab        LDX dat_0080         ;     Set X = dat_0080
7cad: bc b7 8c                  LDY dat_8cb7,X       ;     Set dat_8f77
7cb0: 88                        DEY                  ;            =
7cb1: 8c 77 8f                  STY dat_8f77         ;              dat_8cb7[X] - 1
7cb4: a0 04                     LDY #$04             ;     Set
7cb6: 84 7d                     STY dat_007d         ;         dat_007d = 4
7cb8: a9 ff                     LDA #$ff             ;     Set
7cba: 8d 7a 8f                  STA dat_8f7a         ;         dat_8f7a = $ff
7cbd: a9 00                     LDA #$00             ;     Set
7cbf: 85 6a                     STA dat_006a         ;         dat_006a = 0
7cc1: 85 6b                     STA dat_006b         ;     Set dat_006b = 0
7cc3: a5 7d     loc_7cc3        LDA dat_007d         ;     Loop
7cc5: 0a                        ASL                  ;         Set
7cc6: 0a                        ASL                  ;             Y
7cc7: 0d e1 7d                  ORA dat_7de1         ;               =
7cca: a8                        TAY                  ;                 (dat_007d << 2) | dat_7de1
7ccb: b1 7b                     LDA (dat_007b_L),Y   ;         Set                    (get wall type byte and mask bits)
7ccd: 2d e0 7d                  AND dat_7de0         ;             A = (*dat_007b_L)[Y] & dat_7de0
7cd0: d0 03                     BNE loc_7cd5         ;         If (A != 0)                  (at least one wall is non-0)
7cd2: 4c 36 7d                  JMP loc_7d36         ;         Then
7cd5: 2c e0 7d  loc_7cd5        BIT dat_7de0         ;             If (dat_7de0 < 0)  (type in high nibble, shift right)
7cd8: 10 04                     BPL loc_7cde         ;             Then
7cda: 4a                        LSR                  ;                 Set
7cdb: 4a                        LSR                  ;                     A
7cdc: 4a                        LSR                  ;                       =
7cdd: 4a                        LSR                  ;                         A >> 4
                                                     ;             End If
7cde: 8d 75 8f  loc_7cde        STA dat_8f75         ;             Set dat_8f75 = A              (A = wall type (0..15))
7ce1: a4 7d                     LDY dat_007d         ;             Set
7ce3: c8                        INY                  ;                 Y = dat_007d + 1
7ce4: b9 d7 8c                  LDA dat_8cd7,Y       ;             Set
7ce7: 85 81                     STA dat_0081         ;                 dat_0081 = dat_8cd7[Y]
7ce9: b9 e2 8c                  LDA dat_8ce2,Y       ;             Set
7cec: 85 82                     STA dat_0082         ;                 dat_0082 = dat_8ce2[Y]
7cee: b9 2f 8d                  LDA dat_8d2f,Y       ;             Set
7cf1: 85 83                     STA dat_0083         ;                 dat_0083 = dat_8d2f[Y]
7cf3: b9 35 8d                  LDA dat_8d35,Y       ;             Set
7cf6: 85 84                     STA dat_0084         ;                 dat_0084 = dat_8d35[Y]
7cf8: a4 80                     LDY dat_0080         ;             Set
7cfa: c8                        INY                  ;                 Y = dat_0080 + 1
7cfb: 20 0d 7e                  JSR sub_7e0d         ;             Call $7e0d [sub_7e0d]
7cfe: c9 48                     CMP #$48             ;             If (A < $48 (72))
7d00: b0 34                     BCS loc_7d36         ;             Then
7d02: 38                        SEC                  ;                 Set
7d03: e9 01                     SBC #$01             ;                     A = A - 1
7d05: 85 85                     STA dat_0085         ;                 Set dat_0085 = A
7d07: 85 63                     STA dat_0063         ;                 Set dat_0063 = A
7d09: a4 7d                     LDY dat_007d         ;                 Set Y = dat_007d
7d0b: b9 d7 8c                  LDA dat_8cd7,Y       ;                 Set
7d0e: 85 81                     STA dat_0081         ;                     dat_0081 = dat_8cd7[Y]
7d10: b9 e2 8c                  LDA dat_8ce2,Y       ;                 Set
7d13: 85 82                     STA dat_0082         ;                     dat_0082 = dat_8ce2[Y]
7d15: b9 2f 8d                  LDA dat_8d2f,Y       ;                 Set
7d18: 85 83                     STA dat_0083         ;                     dat_0083 = dat_8d2f[Y]
7d1a: b9 35 8d                  LDA dat_8d35,Y       ;                 Set
7d1d: 85 84                     STA dat_0084         ;                     dat_0084 = dat_8d35[Y]
7d1f: a4 80                     LDY dat_0080         ;                 Set
7d21: c8                        INY                  ;                     Y = dat_0080 + 1
7d22: 20 0d 7e                  JSR sub_7e0d         ;                 Call $7e0d [sub_7e0d]
7d25: 85 86                     STA dat_0086         ;                 Set dat_0086 = A
7d27: a5 85                     LDA dat_0085         ;                 Set
7d29: 38                        SEC                  ;                     dat_0087
7d2a: e5 86                     SBC dat_0086         ;                        =
7d2c: 85 87                     STA dat_0087         ;                          dat_0085 - dat_0086
7d2e: 20 ec 7d                  JSR sub_7dec         ;                 Call $7dec [sub_7dec]
7d31: 85 67                     STA dat_0067         ;                 Set dat_0067 = A
7d33: 20 ea 78                  JSR sub_78ea         ;                 Call $78ea [sub_78ea]
                                                     ;             End If
                                                     ;         End If
7d36: c6 7d     loc_7d36        DEC dat_007d         ;         Subtract 1 from dat_007d
7d38: ce 77 8f                  DEC dat_8f77         ;         Subtract 1 from dat_8f77
7d3b: 30 03                     BMI loc_7d40         ;     Repeat
7d3d: 4c c3 7c                  JMP loc_7cc3         ;        while (dat_8f77 >= 0)
7d40: a6 80     loc_7d40        LDX dat_0080         ;     Set X = dat_0080
7d42: bc b7 8c                  LDY dat_8cb7,X       ;     Set dat_8f77
7d45: 88                        DEY                  ;            =
7d46: 8c 77 8f                  STY dat_8f77         ;              dat_8cb7[X] - 1
7d49: a0 06                     LDY #$06             ;     Set
7d4b: 84 7d                     STY dat_007d         ;         dat_007d = 6
7d4d: a9 01                     LDA #$01             ;     Set
7d4f: 8d 7a 8f                  STA dat_8f7a         ;         dat_8f7a = 1
7d52: a9 00                     LDA #$00             ;     Set
7d54: 85 6a                     STA dat_006a         ;         dat_006a = 0
7d56: 85 6b                     STA dat_006b         ;     Set dat_006b = 0
7d58: a5 7d     loc_7d58        LDA dat_007d         ;     Loop
7d5a: 0a                        ASL                  ;         Set
7d5b: 0a                        ASL                  ;             Y
7d5c: 0d e1 7d                  ORA dat_7de1         ;               =
7d5f: a8                        TAY                  ;                 (dat_007d << 2) | dat_7de1
7d60: b1 7b                     LDA (dat_007b_L),Y   ;         Set
7d62: 2d e0 7d                  AND dat_7de0         ;             A = (*dat_007b_L)[Y] & dat_7de0
7d65: d0 03                     BNE loc_7d6a         ;         If (A == 0)
7d67: 4c c9 7d                  JMP loc_7dc9         ;         Then
7d6a: 2c e0 7d  loc_7d6a        BIT dat_7de0         ;             If (dat_7de0 < 0)
7d6d: 10 04                     BPL loc_7d73         ;             Then
7d6f: 4a                        LSR                  ;                 Set
7d70: 4a                        LSR                  ;                     A
7d71: 4a                        LSR                  ;                       =
7d72: 4a                        LSR                  ;                         A << 4
                                                     ;             End If
7d73: 8d 75 8f  loc_7d73        STA dat_8f75         ;             Set dat_8f75 = A
7d76: a4 7d                     LDY dat_007d         ;             Set
7d78: 88                        DEY                  ;                 Y = dat_007d - 1
7d79: b9 d7 8c                  LDA dat_8cd7,Y       ;             Set
7d7c: 85 81                     STA dat_0081         ;                 dat_0081 = dat_8cd7[Y]
7d7e: b9 e2 8c                  LDA dat_8ce2,Y       ;             Set
7d81: 85 82                     STA dat_0082         ;                 dat_0082 = dat_8ce2[Y]
7d83: b9 78 8d                  LDA dat_8d78,Y       ;             Set
7d86: 85 83                     STA dat_0083         ;                 dat_0083 = dat_8d78[Y]
7d88: b9 7e 8d                  LDA dat_8d7e,Y       ;             Set
7d8b: 85 84                     STA dat_0084         ;                 dat_0084 = dat_8d7e[Y]
7d8d: a4 80                     LDY dat_0080         ;             Set
7d8f: c8                        INY                  ;                 Y = dat_0080 + 1
7d90: 20 2d 7e                  JSR sub_7e2d         ;             Call $7e2d [sub_7e2d]
7d93: c9 48                     CMP #$48             ;             If (A < $48 (72))
7d95: b0 32                     BCS loc_7dc9         ;             Then
7d97: 85 85                     STA dat_0085         ;                 Set dat_0085 = A
7d99: 85 63                     STA dat_0063         ;                 Set dat_0063 = A
7d9b: a4 7d                     LDY dat_007d         ;                 Set Y = dat_007d
7d9d: b9 d7 8c                  LDA dat_8cd7,Y       ;                 Set
7da0: 85 81                     STA dat_0081         ;                     dat_0081 = dat_8cd7[Y]
7da2: b9 e2 8c                  LDA dat_8ce2,Y       ;                 Set
7da5: 85 82                     STA dat_0082         ;                     dat_0082 = dat_8ce2[Y]
7da7: b9 78 8d                  LDA dat_8d78,Y       ;                 Set
7daa: 85 83                     STA dat_0083         ;                     dat_0083 = dat_8d78[Y]
7dac: b9 7e 8d                  LDA dat_8d7e,Y       ;                 Set
7daf: 85 84                     STA dat_0084         ;                     dat_0084 = dat_8d7e[Y]
7db1: a4 80                     LDY dat_0080         ;                 Set
7db3: c8                        INY                  ;                     Y = dat_0080 + 1
7db4: 20 2d 7e                  JSR sub_7e2d         ;                 Call $7e2d [sub_7e2d]
7db7: 85 86                     STA dat_0086         ;                 Set dat_0086 = A
7db9: 18                        CLC                  ;                 Set
7dba: e5 85                     SBC dat_0085         ;                     A = A - dat_0085
7dbc: 85 87                     STA dat_0087         ;                 Set dat_0087 = A
7dbe: a4 80                     LDY dat_0080         ;                 Set
7dc0: c8                        INY                  ;                     Y = dat_0080 + 1
7dc1: 20 ec 7d                  JSR sub_7dec         ;                 Call $7dec [sub_7dec]
7dc4: 85 67                     STA dat_0067         ;                 Set dat_0067 = A
7dc6: 20 ea 78                  JSR sub_78ea         ;                 Call $78ea [sub_78ea]
                                                     ;             End If
                                                     ;         End If
7dc9: e6 7d     loc_7dc9        INC dat_007d         ;         Add 1 to dat_007d
7dcb: ce 77 8f                  DEC dat_8f77         ;         Subtract 1 from dat_8f77
7dce: 30 03                     BMI loc_7dd3         ;     Repeat
7dd0: 4c 58 7d                  JMP loc_7d58         ;        while (dat_8f77 >= 0)
7dd3: a6 80     loc_7dd3        LDX dat_0080         ;     Set X = dat_0080
7dd5: e8                        INX                  ;     Add 1 to X
7dd6: e0 0a                     CPX #$0a             ; Repeat
7dd8: b0 03                     BCS loc_7ddd         ;    while
7dda: 4c 1f 7b                  JMP loc_7b1f         ;       (X < 10)
7ddd: 60        loc_7ddd        RTS                  ; Return to caller

7dde: 00        dat_7dde        .BYTE $00            ;
7ddf: 00        dat_7ddf        .BYTE $00            ;
7de0: 00        dat_7de0        .BYTE $00            ;
7de1: 00        dat_7de1        .BYTE $00            ;
7de2: 00        dat_7de2        .BYTE $00            ;
7de3: 00        dat_7de3        .BYTE $00            ;
7de4: 01 00 01  dat_7de4        .BYTE $01,$00,$01    ;
7de7: 00                        .BYTE $00            ;
7de8: dd 00 00  dat_7de8        .BYTE $dd,$00,$00    ;
7deb: dd                        .BYTE $dd            ;

                ;
                ; Input
                ;   Y        - Index into dat_8d24 (power of 2 to divide by, minus one)
                ;   dat_007f -
                ;
                ; ???
                ;   dat_007a -
                ;
7dec: b9 24 8d  sub_7dec        LDA dat_8d24,Y       ; Set
7def: 85 78                     STA dat_0078         ;     dat_0078 = dat_8d24[Y]
7df1: a5 7f                     LDA dat_007f         ; Set
7df3: 85 79                     STA dat_0079         ;     dat_0079 = dat_007f
7df5: 20 1f 7a                  JSR sub_7a1f         ; Call $7a1f [sub_7a1f]
7df8: a2 00                     LDX #$00             ; Set X = 0
7dfa: 38        loc_7dfa        SEC                  ; Loop
                                                     ;     Set C = 1
7dfb: e8        loc_7dfb        INX                  ;     Loop
                                                     ;         Add 1 to X
7dfc: e9 24                     SBC #$24             ;         Set A = A - $24 (36) - ~C     (C = 0 on underflow else 1)
7dfe: b0 fb                     BCS loc_7dfb         ;     Repeat while (C == 1)
7e00: c6 7a                     DEC dat_007a         ;     Subtract 1 from dat_007a
7e02: 10 f6                     BPL loc_7dfa         ; Repeat while (dat_007a >= 0)
7e04: ca                        DEX                  ; Subtract 1 from X
7e05: 8a                        TXA                  ; Set                                   (C = 0 at this point)
7e06: 69 23                     ADC #$23             ;     A = X - $23 (35) - 1
7e08: 38                        SEC                  ; Set
7e09: f9 72 8d                  SBC dat_8d72,Y       ;     A = A - dat_8d72
7e0c: 60                        RTS                  ; Return to caller

                ; Same as sub_7e2d except for the final calculation of A (subtracts instead of adds)
                ;
                ; Output
                ;   A   -
                ;   C   - used?
                ;
7e0d: b1 81     sub_7e0d        LDA (dat_0081),Y     ; Set
7e0f: 85 78                     STA dat_0078         ;     dat_0078 = (*dat_0081)[Y]
7e11: a5 7f                     LDA dat_007f         ; Set
7e13: 85 79                     STA dat_0079         ;     dat_0079 = dat_007f
7e15: 20 1f 7a                  JSR sub_7a1f         ; Call $7a1f [sub_7a1f]     (TODO: Presumably A is a return value?)
7e18: a2 00                     LDX #$00             ; Set X = 0
7e1a: 38        loc_7e1a        SEC                  ; Loop
                                                     ;     Set C = 1
7e1b: e8        loc_7e1b        INX                  ;     Loop
                                                     ;         Add 1 to X
7e1c: e9 24                     SBC #$24             ;         Set A = A - $24 - ~C
7e1e: b0 fb                     BCS loc_7e1b         ;     Repeat while (C == 1)
7e20: c6 7a                     DEC dat_007a         ;     Subtract 1 from dat_007a
7e22: 10 f6                     BPL loc_7e1a         ; Repeat while (loc_7e1a >= 0)
7e24: ca                        DEX                  ; Subtract 1 from X
7e25: 86 7e                     STX dat_007e         ; Set dat_007e = X
7e27: b1 83                     LDA (dat_0083),Y     ; Set A
7e29: 38                        SEC                  ;       =
7e2a: e5 7e                     SBC dat_007e         ;         (*dat_0083)[Y] - dat_007e     (C = 0 on underflow else 1)
7e2c: 60                        RTS                  ; Return to caller

                ; Same as sub_7e0d except for the final calculation of A (adds instead of subtracts)
                ;
                ; Output
                ;   A   -
                ;   C   - used?
                ;
7e2d: b1 81     sub_7e2d        LDA (dat_0081),Y     ; Set
7e2f: 85 78                     STA dat_0078         ;     dat_0078 = (*dat_0081)[Y]
7e31: a5 7f                     LDA dat_007f         ; Set
7e33: 85 79                     STA dat_0079         ;     dat_0079 = dat_007f
7e35: 20 1f 7a                  JSR sub_7a1f         ; Call $7a1f [sub_7a1f]     (TODO: Presumably A is a return value?)
7e38: a2 00                     LDX #$00             ; Set X = 0
7e3a: 38        loc_7e3a        SEC                  ; Loop
                                                     ;     Set C = 1
7e3b: e8        loc_7e3b        INX                  ;     Loop
                                                     ;         Add 1 to X
7e3c: e9 24                     SBC #$24             ;         Set A = A - $24 - ~C
7e3e: b0 fb                     BCS loc_7e3b         ;     Repeat while (C == 1)
7e40: c6 7a                     DEC dat_007a         ;     Subtract 1 from dat_007a
7e42: 10 f6                     BPL loc_7e3a         ; Repeat while (dat_007a >= 0)
7e44: ca                        DEX                  ; Subtract 1 from X
7e45: 86 7e                     STX dat_007e         ; Set dat_007e = X
7e47: b1 83                     LDA (dat_0083),Y     ; Set A
7e49: 18                        CLC                  ;       =
7e4a: 65 7e                     ADC dat_007e         ;         (*dat_0083)[Y] + dat_007e      (C = 1 on overflow else 0)
7e4c: 60                        RTS                  ; Return to caller

                ; Checks the loaded map's zone references against the player's position and updates the current zone
                ; data if the player has moved into a new zone.
                ;
                ; Input
                ;   CHR_LOC_X  - Player's current horizontal map position
                ;   CHR_LOC_Y  - Player's current vertical map position
                ;   CurZoneId  - Player's current zone
                ;   ZoneRefTbl - The zone reference table for the currently loaded map
                ;   ZoneDefTbl - The zone definition table for the currently loaded map
                ;
                ; Output
                ;   CurZoneId        - Updated if the player moved into a new zone
                ;   CurZoneTex[0..7] - Updated if the player moved into a new zone
                ;
7e4d: ad 00 af  sub_7e4d        LDA ZoneRefsSize     ; Set
7e50: 0a                        ASL                  ;     X
7e51: 0a                        ASL                  ;       =
7e52: 18                        CLC                  ;         ZoneRefsSize * 5
7e53: 6d 00 af                  ADC ZoneRefsSize     ;                              (X is offset to last zone ref entry)
7e56: aa                        TAX                  ;
7e57: ad 13 63  loc_7e57        LDA CHR_LOC_X        ; Loop
7e5a: dd 04 af                  CMP ZoneRefX1,X      ;     If
7e5d: 90 52                     BCC loc_7eb1         ;        (CHR_LOC_X >= ZoneRefX1[X])
7e5f: dd 02 af                  CMP ZoneRefX2,X      ;        And
7e62: b0 4d                     BCS loc_7eb1         ;        (CHR_LOC_X < ZoneRefX2[X])
7e64: ad 14 63                  LDA CHR_LOC_Y        ;        And
7e67: dd 01 af                  CMP ZoneRefY1,X      ;        (CHR_LOC_Y >= ZoneRefY1[X])
7e6a: 90 45                     BCC loc_7eb1         ;        And
7e6c: dd 03 af                  CMP ZoneRefY2,X      ;        (CHR_LOC_Y < ZoneRefY2[X])
7e6f: b0 40                     BCS loc_7eb1         ;     Then
7e71: bd 05 af                  LDA ZoneRefId,X      ;         Set A = ZoneRefId[X]
7e74: cd 12 19  loc_7e74        CMP CurZoneId        ;         If (A != CurZoneId)
7e77: f0 37                     BEQ loc_7eb0         ;         Then
7e79: 8d 12 19                  STA CurZoneId        ;             Set CurZoneId = A
7e7c: 0a                        ASL                  ;             Set
7e7d: 0a                        ASL                  ;                 X
7e7e: 0a                        ASL                  ;                   =
7e7f: aa                        TAX                  ;                     CurZoneId << 3
7e80: a0 00                     LDY #$00             ;             Set Y = 0 (8 iterations [0..7])
7e82: bd 7e af  loc_7e82        LDA ZoneDefTex,X     ;             Loop
7e85: 99 4b 19                  STA CurZoneTex,Y     ;               Set CurZoneTex[Y] = ZoneDefTex[X]
7e88: e8                        INX                  ;                 Add 1 to X
7e89: c8                        INY                  ;                 Add 1 to Y
7e8a: c0 08                     CPY #$08             ;             Repeat
7e8c: 90 f4                     BCC loc_7e82         ;                while (Y < 8)
7e8e: ad 4e 19                  LDA CurZneWallClr0   ;             Set A = CurZneWallClr0
7e91: ae 4f 19                  LDX CurZneWallClr1   ;             Set X = CurZneWallClr1
7e94: ac 50 19                  LDY CurZneWallClr2   ;             Set Y = CurZneWallClr2
7e97: 8d 50 19                  STA CurZneWallClr2   ;             Set CurZneWallClr2 = A
7e9a: 8e 4e 19                  STX CurZneWallClr0   ;             Set CurZneWallClr0 = X
7e9d: 8c 4f 19                  STY CurZneWallClr1   ;             Set CurZneWallClr1 = Y
7ea0: ad 4c 19                  LDA CurZoneUnk       ;             Set CurZoneWarmth
7ea3: 29 f0                     AND #$f0             ;                    =
7ea5: 8d 53 19                  STA CurZoneWarmth    ;                      CurZoneUnk & $f0
7ea8: ad 4c 19                  LDA CurZoneUnk       ;             Set CurZoneUnk
7eab: 29 0f                     AND #$0f             ;                    =
7ead: 8d 4c 19                  STA CurZoneUnk       ;                      CurZoneUnk & $0f
                                                     ;         End If
7eb0: 60        loc_7eb0        RTS                  ;         Return to caller
                                                     ;     End If
7eb1: 8a        loc_7eb1        TXA                  ;     Set
7eb2: 38                        SEC                  ;         X
7eb3: e9 05                     SBC #$05             ;           =
7eb5: aa                        TAX                  ;             X - 5
7eb6: b0 9f                     BCS loc_7e57         ; Repeat while (C == 1)                    (repeat if no underflow)
7eb8: a9 00                     LDA #$00             ; Set A = 0        (Did not match any zone ref, use default zone 0)
7eba: 90 b8                     BCC loc_7e74         ; Continue @ $7e74 [loc_7e74]                  (C is always 0 here)

                ;
                ; - Sets dat_0089_L/H to $83c6 [CmpssFrameImg]
                ; - Continues @ $7f4b [cont_7f4b]
                ;
7ebc: a9 c6     sub_7ebc        LDA #$c6             ; Set
7ebe: 85 89                     STA dat_0089_L       ;     dat_0089_L/H
7ec0: a9 83                     LDA #$83             ;        =
7ec2: 85 8a                     STA dat_0089_H       ;          $83c6 [CmpssFrameImg]
7ec4: 4c 4b 7f                  JMP cont_7f4b        ; Continue @ $7f4b [cont_7f4b]

                ;
                ; Continues @ $7ef4 [sub_7ef4]
                ;
7ec7: a9 c6     sub_7ec7        LDA #$c6             ; Set
7ec9: 85 89                     STA dat_0089_L       ;     dat_0089_L/H
7ecb: a9 83                     LDA #$83             ;        =
7ecd: 85 8a                     STA dat_0089_H       ;          $83c6 [CmpssFrameImg]
7ecf: 20 f4 7e                  JSR sub_7ef4         ; Call $7ef4 [sub_7ef4]
7ed2: ad 12 63                  LDA CHR_LOC_ORIENT   ; Set X
7ed5: 0a                        ASL                  ;       =
7ed6: aa                        TAX                  ;         CHR_LOC_ORIENT * 2
7ed7: bd be 83                  LDA CmpssArrwAdr,X   ; Set
7eda: 85 89                     STA dat_0089_L       ;     dat_0089_L/H
7edc: bd bf 83                  LDA CmpssArrwAdr+1,X ;        =
7edf: 85 8a                     STA dat_0089_H       ;          CmpssArrwAdr[X,X+1]
7ee1: 4c f4 7e                  JMP sub_7ef4         ; Continue @ $7ef4 [sub_7ef4]

                ;
                ; Input
                ;   A    - Stick direction code [0..15] for retrieving value from MoveStickMap to use as an offset
                ;            into MoveArrowAdr [0, 2, 4, 6].
                ;
                ; Output
                ;   dat_0089_L/H - Holds the retrieved address
                ;
                ; Continues @ $7ef4 [sub_7ef4]
                ;
7ee4: a8        sub_7ee4        TAY                  ; Set Y = A
7ee5: be ae 83                  LDX MoveStickMap,Y   ; Set X = MoveStickMap[Y]
7ee8: d0 00                     BNE loc_7eea         ; (hmm... why?)
7eea: bd a6 83  loc_7eea        LDA MoveArrowAdr,X   ; Set
7eed: 85 89                     STA dat_0089_L       ;     dat_0089_L = MoveArrowAdr[X]
7eef: bd a7 83                  LDA MoveArrowAdr+1,X ; Set
7ef2: 85 8a                     STA dat_0089_H       ;     dat_0089_H = MoveArrowAdr[X + 1]

                ; Copies a character set-based image into a character set
                ;
                ; Input
                ;   dat_0089_L/H   - Address of a character set image. Starts with a 5 byte header, followed by the
                ;                    character set definitions.
                ;                       Header
                ;                          0: Bytes per row (divide by 8 for number of characters wide)
                ;                          1: Number of rows
                ;                          2: LSB of amount to add to destination address per row
                ;                          3: MSB of amount to add to destination address per row
                ;                          4: Index into dat_7fb3_L/H used to select the base destination character
                ;                             set offset.
                ;
                ; ???
                ;   dat_008d   - Set to dat_0089_L/H[0]. Number of bytes per row.
                ;   dat_008e   - Initially set to dat_0089_L/H[1]. Number of rows to copy, 0 on return.
                ;   dat_008f   - Initially set to dat_0089_L/H[4]. Offset from dat_7fb3_L/H. Incremented dat_008e times.
                ;
                putImage
7ef4: a0 00     sub_7ef4        LDY #$00             ; Set Y  = 0
7ef6: b1 89                     LDA (dat_0089_L),Y   ; Set
7ef8: 85 8d                     STA dat_008d         ;     dat_008d = (*dat_0089_L)[0]
7efa: c8                        INY                  ; Add 1 to Y   (Y = 1)
7efb: b1 89                     LDA (dat_0089_L),Y   ; Set
7efd: 85 8e                     STA dat_008e         ;     dat_008e = (*dat_0089_L)[1]
7eff: c8                        INY                  ; Add 1 to Y   (Y = 2)
7f00: b1 89                     LDA (dat_0089_L),Y   ; Set
7f02: 8d 22 7f                  STA smc_7f21+1       ;     smc_7f21[1] = (*dat_0089_L)[2]
7f05: c8                        INY                  ; Add 1 to Y   (Y = 3)
7f06: b1 89                     LDA (dat_0089_L),Y   ; Set
7f08: 8d 2a 7f                  STA smc_7f29+1       ;     smc_7f29[1] = (*dat_0089_L)[3]
7f0b: c8                        INY                  ; Add 1 to Y   (Y = 4)
7f0c: b1 89                     LDA (dat_0089_L),Y   ; Set
7f0e: 85 8f                     STA dat_008f         ;     dat_008f = (*dat_0089_L)[4]
7f10: a5 89                     LDA dat_0089_L       ; Set
7f12: 18                        CLC                  ;     dat_0089_L
7f13: 69 05                     ADC #$05             ;        =
7f15: 85 89                     STA dat_0089_L       ;          dat_0089_L + 5
7f17: 90 02                     BCC loc_7f1b         ; If (C == 1) Then
7f19: e6 8a                     INC dat_0089_H       ;     Add 1 to dat_0089_H
                                                     ; End If
7f1b: a6 8f     loc_7f1b        LDX dat_008f         ; Loop
                                                     ;     Set X = dat_008f
7f1d: bd b3 7f                  LDA dat_7fb3_L,X     ;     Set
7f20: 18                        CLC                  ;         smc_7f33[1]
7f21: 69 ff     smc_7f21        ADC #$ff             ;            =
7f23: 8d 34 7f                  STA smc_7f33+1       ;              dat_7fb3_L[X] + smc_7f21[1]
7f26: bd bc 7f                  LDA dat_7fb3_H,X     ;     Set smc_7f33[2]
7f29: 69 ff     smc_7f29        ADC #$ff             ;            =
7f2b: 8d 35 7f                  STA smc_7f33+2       ;              dat_7fb3_H[X] + smc_7f29[1] + C
7f2e: a4 8d                     LDY dat_008d         ;     Set
7f30: 88                        DEY                  ;         Y = dat_008d - 1                           (copy one row)
7f31: b1 89     smc_7f31        LDA (dat_0089_L),Y   ;     Loop
7f33: 99 ff ff  smc_7f33        STA $ffff,Y          ;         Set (*(smc_7f33[1])) = (*dat_0089_L)[Y]
7f36: 88                        DEY                  ;         Subtract 1 from Y
7f37: 10 f8                     BPL smc_7f31         ;     Repeat while (Y >= 0)
7f39: a5 89                     LDA dat_0089_L       ;     Set
7f3b: 18                        CLC                  ;         dat_0089_L
7f3c: 65 8d                     ADC dat_008d         ;            =
7f3e: 85 89                     STA dat_0089_L       ;              dat_0089_L + dat_008d
7f40: 90 02                     BCC loc_7f44         ;     If (C == 1) Then
7f42: e6 8a                     INC dat_0089_H       ;         Add 1 to dat_0089_H
                                                     ;     End If
7f44: e6 8f     loc_7f44        INC dat_008f         ;     Add 1 to dat_008f
7f46: c6 8e                     DEC dat_008e         ;     Subtract 1 from dat_008e
7f48: d0 d1                     BNE loc_7f1b         ; Repeat while (dat_008e != 0)
7f4a: 60                        RTS                  ; Return to caller

                ;
                ; Same as sub_7ef4 except smc_7f31 is "LDA #$ff" instead of "LDA (dat_0089_L),Y"
                ;
7f4b: a9 a9     cont_7f4b       LDA #$a9             ; Set
7f4d: 8d 31 7f                  STA smc_7f31         ;     smc_7f31
7f50: a9 ff                     LDA #$ff             ;        =
7f52: 8d 32 7f                  STA smc_7f31+1       ;          "LDA #$ff"
7f55: 20 f4 7e                  JSR sub_7ef4         ; Call $7ef4 [sub_7ef4]
7f58: a9 b1                     LDA #$b1             ; Set
7f5a: 8d 31 7f                  STA smc_7f31         ;     smc_7f31
7f5d: a9 89                     LDA #$89             ;       =
7f5f: 8d 32 7f                  STA smc_7f31+1       ;         "LDA (dat_0089_L),Y"
7f62: 60                        RTS                  ; Return to caller

                ;
                ; Everything below here appears to be data
                ;

7f63: 00 08 10  unk_Mul8Tbl_L   .BYTE $00,$08,$10                      ; 40 bytes: LSB for 16-bit multiplication table
7f66: 18 20 28 30 38 40 48 50   .BYTE $18,$20,$28,$30,$38,$40,$48,$50  ;           by factors of 8 (0 * 8 to 39 * 8)
7f6e: 58 60 68 70 78 80 88 90   .BYTE $58,$60,$68,$70,$78,$80,$88,$90  ;
7f76: 98 a0 a8 b0 b8 c0 c8 d0   .BYTE $98,$a0,$a8,$b0,$b8,$c0,$c8,$d0  ;
7f7e: d8 e0 e8 f0 f8 00 08 10   .BYTE $d8,$e0,$e8,$f0,$f8,$00,$08,$10  ;
7f86: 18 20 28 30 38            .BYTE $18,$20,$28,$30,$38

7f8b: 00 00 00  unk_Mul8Tbl_H   .BYTE $00,$00,$00                      ; 40 bytes: LSB for 16-bit multiplication table
7f8e: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ;           by factors of 8 (0 * 8 to 39 * 8)
7f96: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ;
7f9e: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ;
7fa6: 00 00 00 00 00 01 01 01   .BYTE $00,$00,$00,$00,$00,$01,$01,$01  ;
7fae: 01 01 01 01 01            .BYTE $01,$01,$01,$01,$01              ;

7fb3: 00 40 80  dat_7fb3_L      .BYTE $00,$40,$80              ; 9 bytes: LSB of starting address of first character of
7fb6: 00 40 80 00 40 80         .BYTE $00,$40,$80,$00,$40,$80  ;          corresponding text line [0..8] within the
                                                               ;          graphics character sets.
                                                               ;          This value is assigned to smc_7f33[1].

7fbc: 08 09 0a  dat_7fb3_H      .BYTE $08,$09,$0a              ; 9 bytes: MSB of starting address of first character of
7fbf: 0c 0d 0e 10 11 12         .BYTE $0c,$0d,$0e,$10,$11,$12  ;          corresponding text line [0..8] within the
                                                               ;          graphics character sets.
                                                               ;          This value is assigned to smc_7f33[2].
                                                               ;    0: $0800 [GfxTopCharset]
                                                               ;    1: $0940 [GfxTopCharset + $140 (320 / 40 chars)]
                                                               ;    2: $0a80 [GfxTopCharset + $240 (640 / 80 chars)]
                                                               ;    3: $0c00 [GfxMidCharset]
                                                               ;    4: $0d40 [GfxMidCharset + $140 (320 / 40 chars)]
                                                               ;    5: $0e80 [GfxMidCharset + $240 (640 / 80 chars)]
                                                               ;    6: $1000 [GfxBtmCharset]
                                                               ;    7: $1140 [GfxBtmCharset + $140 (320 / 40 chars)]
                                                               ;    8: $1280 [GfxBtmCharset + $240 (640 / 80 chars)]

7fc5: 58 59 5a  dat_7fc5_L      .BYTE $58,$59,$5a                      ; 72 bytes: LSBs of destination addresses within
7fc8: 5b 5c 5d 5e 5f 98 99 9a   .BYTE $5b,$5c,$5d,$5e,$5f,$98,$99,$9a  ;   the graphics character sets.
7fd0: 9b 9c 9d 9e 9f d8 d9 da   .BYTE $9b,$9c,$9d,$9e,$9f,$d8,$d9,$da  ;   (copyFrameBuf: assigns to smc_787b[1])
7fd8: db dc dd de df 58 59 5a   .BYTE $db,$dc,$dd,$de,$df,$58,$59,$5a  ;
7fe0: 5b 5c 5d 5e 5f 98 99 9a   .BYTE $5b,$5c,$5d,$5e,$5f,$98,$99,$9a  ;
7fe8: 9b 9c 9d 9e 9f d8 d9 da   .BYTE $9b,$9c,$9d,$9e,$9f,$d8,$d9,$da  ;
7ff0: db dc dd de df 58 59 5a   .BYTE $db,$dc,$dd,$de,$df,$58,$59,$5a  ;
7ff8: 5b 5c 5d 5e 5f 98 99 9a   .BYTE $5b,$5c,$5d,$5e,$5f,$98,$99,$9a  ;
8000: 9b 9c 9d 9e 9f d8 d9 da   .BYTE $9b,$9c,$9d,$9e,$9f,$d8,$d9,$da  ;
8008: db dc dd de df            .BYTE $db,$dc,$dd,$de,$df              ;

800d: 08 08 08  dat_7fc5_H      .BYTE $08,$08,$08                      ; 72 bytes: MSBs of destination addresses within
8010: 08 08 08 08 08 09 09 09   .BYTE $08,$08,$08,$08,$08,$09,$09,$09  ;   the graphics character sets.
8018: 09 09 09 09 09 0a 0a 0a   .BYTE $09,$09,$09,$09,$09,$0a,$0a,$0a  ;   (copyFrameBuf: assigns to smc_787b[2])
8020: 0a 0a 0a 0a 0a 0c 0c 0c   .BYTE $0a,$0a,$0a,$0a,$0a,$0c,$0c,$0c  ;    0: $0858 [GfxTopCharset + $58]
8028: 0c 0c 0c 0c 0c 0d 0d 0d   .BYTE $0c,$0c,$0c,$0c,$0c,$0d,$0d,$0d  ;    1: $0859 [GfxTopCharset + $59]
8030: 0d 0d 0d 0d 0d 0e 0e 0e   .BYTE $0d,$0d,$0d,$0d,$0d,$0e,$0e,$0e  ;    2: $085a [GfxTopCharset + $5a]
8038: 0e 0e 0e 0e 0e 10 10 10   .BYTE $0e,$0e,$0e,$0e,$0e,$10,$10,$10  ;    3: $085b [GfxTopCharset + $5b]
8040: 10 10 10 10 10 11 11 11   .BYTE $10,$10,$10,$10,$10,$11,$11,$11  ;    4: $085c [GfxTopCharset + $5c]
8048: 11 11 11 11 11 12 12 12   .BYTE $11,$11,$11,$11,$11,$12,$12,$12  ;    5: $085d [GfxTopCharset + $5d]
8050: 12 12 12 12 12            .BYTE $12,$12,$12,$12,$12              ;    6: $085e [GfxTopCharset + $5e]
                                                                       ;    7: $085f [GfxTopCharset + $5f]
                                                                       ;    8: $0998 [GfxTopCharset + $198]
                                                                       ;    9: $0999 [GfxTopCharset + $199]
                                                                       ;   10: $099a [GfxTopCharset + $19a]
                                                                       ;   11: $099b [GfxTopCharset + $19b]
                                                                       ;   12: $099c [GfxTopCharset + $19c]
                                                                       ;   13: $099d [GfxTopCharset + $19d]
                                                                       ;   14: $099e [GfxTopCharset + $19e]
                                                                       ;   15: $099f [GfxTopCharset + $19f]
                                                                       ;   16: $0ad8 [GfxTopCharset + $2d8]
                                                                       ;   17: $0ad9 [GfxTopCharset + $2d9]
                                                                       ;   18: $0ada [GfxTopCharset + $2da]
                                                                       ;   19: $0adb [GfxTopCharset + $2db]
                                                                       ;   20: $0adc [GfxTopCharset + $2dc]
                                                                       ;   21: $0add [GfxTopCharset + $2dd]
                                                                       ;   22: $0ade [GfxTopCharset + $2de]
                                                                       ;   23: $0adf [GfxTopCharset + $2df]
                                                                       ;
                                                                       ;   24: $0c58 [GfxMidCharset + $58]
                                                                       ;   25: $0c59 [GfxMidCharset + $59]
                                                                       ;   26: $0c5a [GfxMidCharset + $5a]
                                                                       ;   27: $0c5b [GfxMidCharset + $5b]
                                                                       ;   28: $0c5c [GfxMidCharset + $5c]
                                                                       ;   29: $0c5d [GfxMidCharset + $5d]
                                                                       ;   30: $0c5e [GfxMidCharset + $5e]
                                                                       ;   31: $0c5f [GfxMidCharset + $5f]
                                                                       ;   32: $0d98 [GfxMidCharset + $198]
                                                                       ;   33: $0d99 [GfxMidCharset + $199]
                                                                       ;   34: $0d9a [GfxMidCharset + $19a]
                                                                       ;   35: $0d9b [GfxMidCharset + $19b]
                                                                       ;   36: $0d9c [GfxMidCharset + $19c]
                                                                       ;   37: $0d9d [GfxMidCharset + $19d]
                                                                       ;   38: $0d9e [GfxMidCharset + $19e]
                                                                       ;   39: $0d9f [GfxMidCharset + $19f]
                                                                       ;   40: $0ed8 [GfxMidCharset + $2d8]
                                                                       ;   41: $0ed9 [GfxMidCharset + $2d9]
                                                                       ;   42: $0eda [GfxMidCharset + $2da]
                                                                       ;   43: $0edb [GfxMidCharset + $2db]
                                                                       ;   44: $0edc [GfxMidCharset + $2dc]
                                                                       ;   45: $0edd [GfxMidCharset + $2dd]
                                                                       ;   46: $0ede [GfxMidCharset + $2de]
                                                                       ;   47: $0edf [GfxMidCharset + $2df]
                                                                       ;
                                                                       ;   48: $1058 [GfxBtmCharset + $58]
                                                                       ;   49: $1059 [GfxBtmCharset + $59]
                                                                       ;   50: $105a [GfxBtmCharset + $5a]
                                                                       ;   51: $105b [GfxBtmCharset + $5b]
                                                                       ;   52: $105c [GfxBtmCharset + $5c]
                                                                       ;   53: $105d [GfxBtmCharset + $5d]
                                                                       ;   54: $105e [GfxBtmCharset + $5e]
                                                                       ;   55: $105f [GfxBtmCharset + $5f]
                                                                       ;   56: $1198 [GfxBtmCharset + $198]
                                                                       ;   57: $1199 [GfxBtmCharset + $199]
                                                                       ;   58: $119a [GfxBtmCharset + $19a]
                                                                       ;   59: $119b [GfxBtmCharset + $19b]
                                                                       ;   60: $119c [GfxBtmCharset + $19c]
                                                                       ;   61: $119d [GfxBtmCharset + $19d]
                                                                       ;   62: $119e [GfxBtmCharset + $19e]
                                                                       ;   63: $119f [GfxBtmCharset + $19f]
                                                                       ;   64: $12d8 [GfxBtmCharset + $2d8]
                                                                       ;   65: $12d9 [GfxBtmCharset + $2d9]
                                                                       ;   66: $12da [GfxBtmCharset + $2da]
                                                                       ;   67: $12db [GfxBtmCharset + $2db]
                                                                       ;   68: $12dc [GfxBtmCharset + $2dc]
                                                                       ;   69: $12dd [GfxBtmCharset + $2dd]
                                                                       ;   70: $12de [GfxBtmCharset + $2de]
                                                                       ;   71: $12df [GfxBtmCharset + $2df]

8055: 00 01 02  unk_8055_L      .BYTE $00,$01,$02                      ; 72 bytes: LSBs of ?destination? addresses
8058: 03 04 05 06 07 40 41 42   .BYTE $03,$04,$05,$06,$07,$40,$41,$42  ;           within the graphics character sets.
8060: 43 44 45 46 47 80 81 82   .BYTE $43,$44,$45,$46,$47,$80,$81,$82  ;
8068: 83 84 85 86 87 00 01 02   .BYTE $83,$84,$85,$86,$87,$00,$01,$02  ;
8070: 03 04 05 06 07 40 41 42   .BYTE $03,$04,$05,$06,$07,$40,$41,$42  ;
8078: 43 44 45 46 47 80 81 82   .BYTE $43,$44,$45,$46,$47,$80,$81,$82  ;
8080: 83 84 85 86 87 00 01 02   .BYTE $83,$84,$85,$86,$87,$00,$01,$02  ;
8088: 03 04 05 06 07 40 41 42   .BYTE $03,$04,$05,$06,$07,$40,$41,$42  ;
8090: 43 44 45 46 47 80 81 82   .BYTE $43,$44,$45,$46,$47,$80,$81,$82  ;
8098: 83 84 85 86 87            .BYTE $83,$84,$85,$86,$87              ;

809d: 08 08 08  unk_809d_H      .BYTE $08,$08,$08                      ; 72 bytes: MSBs of ?destination? addresses
80a0: 08 08 08 08 08 09 09 09   .BYTE $08,$08,$08,$08,$08,$09,$09,$09  ;           within the graphics character sets.
80a8: 09 09 09 09 09 0a 0a 0a   .BYTE $09,$09,$09,$09,$09,$0a,$0a,$0a  ;
80b0: 0a 0a 0a 0a 0a 0c 0c 0c   .BYTE $0a,$0a,$0a,$0a,$0a,$0c,$0c,$0c  ;    0: $0858 [GfxTopCharset + $58]
80b8: 0c 0c 0c 0c 0c 0d 0d 0d   .BYTE $0c,$0c,$0c,$0c,$0c,$0d,$0d,$0d  ;    1: $0859 [GfxTopCharset + $59]
80c0: 0d 0d 0d 0d 0d 0e 0e 0e   .BYTE $0d,$0d,$0d,$0d,$0d,$0e,$0e,$0e  ;    2: $085a [GfxTopCharset + $5a]
80c8: 0e 0e 0e 0e 0e 10 10 10   .BYTE $0e,$0e,$0e,$0e,$0e,$10,$10,$10  ;    3: $085b [GfxTopCharset + $5b]
80d0: 10 10 10 10 10 11 11 11   .BYTE $10,$10,$10,$10,$10,$11,$11,$11  ;    4: $085c [GfxTopCharset + $5c]
80d8: 11 11 11 11 11 12 12 12   .BYTE $11,$11,$11,$11,$11,$12,$12,$12  ;    5: $085d [GfxTopCharset + $5d]
80e0: 12 12 12 12 12            .BYTE $12,$12,$12,$12,$12              ;    6: $085e [GfxTopCharset + $5e]
                                                                       ;    7: $085f [GfxTopCharset + $5f]
                                                                       ;    8: $0998 [GfxTopCharset + $198]
                                                                       ;    9: $0999 [GfxTopCharset + $199]
                                                                       ;   10: $099a [GfxTopCharset + $19a]
                                                                       ;   11: $099b [GfxTopCharset + $19b]
                                                                       ;   12: $099c [GfxTopCharset + $19c]
                                                                       ;   13: $099d [GfxTopCharset + $19d]
                                                                       ;   14: $099e [GfxTopCharset + $19e]
                                                                       ;   15: $099f [GfxTopCharset + $19f]
                                                                       ;   16: $0ad8 [GfxTopCharset + $2d8]
                                                                       ;   17: $0ad9 [GfxTopCharset + $2d9]
                                                                       ;   18: $0ada [GfxTopCharset + $2da]
                                                                       ;   19: $0adb [GfxTopCharset + $2db]
                                                                       ;   20: $0adc [GfxTopCharset + $2dc]
                                                                       ;   21: $0add [GfxTopCharset + $2dd]
                                                                       ;   22: $0ade [GfxTopCharset + $2de]
                                                                       ;   23: $0adf [GfxTopCharset + $2df]
                                                                       ;
                                                                       ;   24: $0c58 [GfxMidCharset + $58]
                                                                       ;   25: $0c59 [GfxMidCharset + $59]
                                                                       ;   26: $0c5a [GfxMidCharset + $5a]
                                                                       ;   27: $0c5b [GfxMidCharset + $5b]
                                                                       ;   28: $0c5c [GfxMidCharset + $5c]
                                                                       ;   29: $0c5d [GfxMidCharset + $5d]
                                                                       ;   30: $0c5e [GfxMidCharset + $5e]
                                                                       ;   31: $0c5f [GfxMidCharset + $5f]
                                                                       ;   32: $0d98 [GfxMidCharset + $198]
                                                                       ;   33: $0d99 [GfxMidCharset + $199]
                                                                       ;   34: $0d9a [GfxMidCharset + $19a]
                                                                       ;   35: $0d9b [GfxMidCharset + $19b]
                                                                       ;   36: $0d9c [GfxMidCharset + $19c]
                                                                       ;   37: $0d9d [GfxMidCharset + $19d]
                                                                       ;   38: $0d9e [GfxMidCharset + $19e]
                                                                       ;   39: $0d9f [GfxMidCharset + $19f]
                                                                       ;   40: $0ed8 [GfxMidCharset + $2d8]
                                                                       ;   41: $0ed9 [GfxMidCharset + $2d9]
                                                                       ;   42: $0eda [GfxMidCharset + $2da]
                                                                       ;   43: $0edb [GfxMidCharset + $2db]
                                                                       ;   44: $0edc [GfxMidCharset + $2dc]
                                                                       ;   45: $0edd [GfxMidCharset + $2dd]
                                                                       ;   46: $0ede [GfxMidCharset + $2de]
                                                                       ;   47: $0edf [GfxMidCharset + $2df]
                                                                       ;
                                                                       ;   48: $1058 [GfxBtmCharset + $58]
                                                                       ;   49: $1059 [GfxBtmCharset + $59]
                                                                       ;   50: $105a [GfxBtmCharset + $5a]
                                                                       ;   51: $105b [GfxBtmCharset + $5b]
                                                                       ;   52: $105c [GfxBtmCharset + $5c]
                                                                       ;   53: $105d [GfxBtmCharset + $5d]
                                                                       ;   54: $105e [GfxBtmCharset + $5e]
                                                                       ;   55: $105f [GfxBtmCharset + $5f]
                                                                       ;   56: $1198 [GfxBtmCharset + $198]
                                                                       ;   57: $1199 [GfxBtmCharset + $199]
                                                                       ;   58: $119a [GfxBtmCharset + $19a]
                                                                       ;   59: $119b [GfxBtmCharset + $19b]
                                                                       ;   60: $119c [GfxBtmCharset + $19c]
                                                                       ;   61: $119d [GfxBtmCharset + $19d]
                                                                       ;   62: $119e [GfxBtmCharset + $19e]
                                                                       ;   63: $119f [GfxBtmCharset + $19f]
                                                                       ;   64: $12d8 [GfxBtmCharset + $2d8]
                                                                       ;   65: $12d9 [GfxBtmCharset + $2d9]
                                                                       ;   66: $12da [GfxBtmCharset + $2da]
                                                                       ;   67: $12db [GfxBtmCharset + $2db]
                                                                       ;   68: $12dc [GfxBtmCharset + $2dc]
                                                                       ;   69: $12dd [GfxBtmCharset + $2dd]
                                                                       ;   70: $12de [GfxBtmCharset + $2de]
                                                                       ;   71: $12df [GfxBtmCharset + $2df]

80e5: 38 07 f8  MoveArrowsImg   .BYTE $38,$07,$f8                      ; 397 bytes: All 4 movement arrows (rest state)
80e8: 00 01 ff ff ff ff ff ff   .BYTE $00,$01,$ff,$ff,$ff,$ff,$ff,$ff  ;            charset image. Assigned to
80f0: ff ff ff ff ff ff ff ff   .BYTE $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff  ;            dat_0089_L/H in cont_7641.
80f8: ff ff ff ff ff ff ff ff   .BYTE $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff  ;    5 byte header:
8100: ff ff ff ff ff fb fb e2   .BYTE $ff,$ff,$ff,$ff,$ff,$fb,$fb,$e2  ;     0: $38 (56) - Bytes per row (7 chars wide)
8108: e2 80 ff ff ff ff ff ff   .BYTE $e2,$80,$ff,$ff,$ff,$ff,$ff,$ff  ;     1: $07      - Row count
8110: ff bf ff ff ff ff ff ff   .BYTE $ff,$bf,$ff,$ff,$ff,$ff,$ff,$ff  ;     2: $f8      -
8118: ff ff ff ff ff ff ff ff   .BYTE $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff  ;     3: $00      -
8120: ff ff ff ff ff ff ff ff   .BYTE $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff  ;     4: $01      -
8128: ff ff ff ff ff ff ff ff   .BYTE $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff  ;
8130: ff ff ff fe fe f8 f8 e0   .BYTE $ff,$ff,$ff,$fe,$fe,$f8,$f8,$e0  ;
8138: ea ff 80 00 00 00 00 00   .BYTE $ea,$ff,$80,$00,$00,$00,$00,$00  ;
8140: 80 80 bf 2f 2f 0b 0b 02   .BYTE $80,$80,$bf,$2f,$2f,$0b,$0b,$02  ;
8148: aa bf ff ff ff ff ff ff   .BYTE $aa,$bf,$ff,$ff,$ff,$ff,$ff,$ff  ;
8150: ff ff ff ff ff ff ff ff   .BYTE $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff  ;
8158: ff ff ff ff ff ff ff ff   .BYTE $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff  ;
8160: ff ff ff fe fe fa fa e2   .BYTE $ff,$ff,$ff,$fe,$fe,$fa,$fa,$e2  ;
8168: e2 82 ff ff ff ff ff ff   .BYTE $e2,$82,$ff,$ff,$ff,$ff,$ff,$ff  ;
8170: ff ab 80 80 aa ff ff ff   .BYTE $ff,$ab,$80,$80,$aa,$ff,$ff,$ff  ;
8178: ff ff bf bf bf ff ff ff   .BYTE $ff,$ff,$bf,$bf,$bf,$ff,$ff,$ff  ;
8180: ff fa ff ef ef eb eb e2   .BYTE $ff,$fa,$ff,$ef,$ef,$eb,$eb,$e2  ;
8188: e2 a0 ff ff ff ff ff ff   .BYTE $e2,$a0,$ff,$ff,$ff,$ff,$ff,$ff  ;
8190: ff bf ff fe fe f8 f8 fe   .BYTE $ff,$bf,$ff,$fe,$fe,$f8,$f8,$fe  ;
8198: fe ff 80 00 00 00 00 00   .BYTE $fe,$ff,$80,$00,$00,$00,$00,$00  ;
81a0: 00 80 0b 0b 0b 0b 0b 0b   .BYTE $00,$80,$0b,$0b,$0b,$0b,$0b,$0b  ;
81a8: 0b 0b ff ff ff ff ff ff   .BYTE $0b,$0b,$ff,$ff,$ff,$ff,$ff,$ff  ;
81b0: ff ff f8 f8 f8 f8 f8 f8   .BYTE $ff,$ff,$f8,$f8,$f8,$f8,$f8,$f8  ;
81b8: f8 f8 00 00 00 00 00 00   .BYTE $f8,$f8,$00,$00,$00,$00,$00,$00  ;
81c0: 00 00 bf 2f 2f 0b 0b 2f   .BYTE $00,$00,$bf,$2f,$2f,$0b,$0b,$2f  ;
81c8: 2f bf ff ff ff ff ff ff   .BYTE $2f,$bf,$ff,$ff,$ff,$ff,$ff,$ff  ;
81d0: ff ff 82 e2 e2 fa fa fe   .BYTE $ff,$ff,$82,$e2,$e2,$fa,$fa,$fe  ;
81d8: fe ff ab ff ff ff ff ff   .BYTE $fe,$ff,$ab,$ff,$ff,$ff,$ff,$ff  ;
81e0: ff ff ff ff ff ff aa 80   .BYTE $ff,$ff,$ff,$ff,$ff,$ff,$aa,$80  ;
81e8: 80 80 fa ff ff ff bf bf   .BYTE $80,$80,$fa,$ff,$ff,$ff,$bf,$bf  ;
81f0: bf bf a0 e2 e2 eb eb ef   .BYTE $bf,$bf,$a0,$e2,$e2,$eb,$eb,$ef  ;
81f8: ef ff bf ff ff ff ff ff   .BYTE $ef,$ff,$bf,$ff,$ff,$ff,$ff,$ff  ;
8200: ff ff ff ff ff ff ff ff   .BYTE $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff  ;
8208: ff ff ff ff ff ff ff ff   .BYTE $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff  ;
8210: ff ff ff ea e0 f8 f8 fe   .BYTE $ff,$ff,$ff,$ea,$e0,$f8,$f8,$fe  ;
8218: fe ff 80 80 00 00 00 00   .BYTE $fe,$ff,$80,$80,$00,$00,$00,$00  ;
8220: 00 80 bf aa 02 0b 0b 2f   .BYTE $00,$80,$bf,$aa,$02,$0b,$0b,$2f  ;
8228: 2f bf ff ff ff ff ff ff   .BYTE $2f,$bf,$ff,$ff,$ff,$ff,$ff,$ff  ;
8230: ff ff ff ff ff ff ff ff   .BYTE $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff  ;
8238: ff ff ff ff ff ff ff ff   .BYTE $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff  ;
8240: ff ff ff ff ff ff ff ff   .BYTE $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff  ;
8248: ff ff ff ff ff ff ff ff   .BYTE $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff  ;
8250: ff ff 80 e2 e2 fb fb ff   .BYTE $ff,$ff,$80,$e2,$e2,$fb,$fb,$ff  ;
8258: ff ff bf ff ff ff ff ff   .BYTE $ff,$ff,$bf,$ff,$ff,$ff,$ff,$ff  ;
8260: ff ff ff ff ff ff ff ff   .BYTE $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff  ;
8268: ff ff ff ff ff ff ff ff   .BYTE $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff  ;
8270: ff ff                     .BYTE $ff,$ff                          ;

8272: 18 03 08  MoveArwUpImg    .BYTE $18,$03,$08                      ; 77 bytes: Forward/Up arrow charset image.
8275: 01 01 ff ff ff ff ff ff   .BYTE $01,$01,$ff,$ff,$ff,$ff,$ff,$ff  ;           Referenced in MoveArrowAdr.
827d: ff ff ff ff ff fb fb ea   .BYTE $ff,$ff,$ff,$ff,$ff,$fb,$fb,$ea  ;    5 byte header:
8285: ea aa ff ff ff ff ff ff   .BYTE $ea,$aa,$ff,$ff,$ff,$ff,$ff,$ff  ;     0: $18 (24) - Bytes per row (4 chars wide)
828d: ff bf ff fe fe fa fa ea   .BYTE $ff,$bf,$ff,$fe,$fe,$fa,$fa,$ea  ;     1: $03      - Row count
8295: ea ff aa aa aa aa aa aa   .BYTE $ea,$ff,$aa,$aa,$aa,$aa,$aa,$aa  ;     2: $08      -
829d: aa aa bf af af ab ab aa   .BYTE $aa,$aa,$bf,$af,$af,$ab,$ab,$aa  ;     3: $01      -
82a5: aa bf ff ff ff ff ff ff   .BYTE $aa,$bf,$ff,$ff,$ff,$ff,$ff,$ff  ;     4: $01      -
82ad: ff ab aa aa aa ff ff ff   .BYTE $ff,$ab,$aa,$aa,$aa,$ff,$ff,$ff  ;
82b5: ff ff bf bf bf ff ff ff   .BYTE $ff,$ff,$bf,$bf,$bf,$ff,$ff,$ff  ;
82bd: ff fa                     .BYTE $ff,$fa                          ;

82bf: 18 03 18  MoveArwRgtImg   .BYTE $18,$03,$18                      ; 77 bytes: Move right arrow charset image.
82c2: 01 03 bf bf bf ff ff ff   .BYTE $01,$03,$bf,$bf,$bf,$ff,$ff,$ff  ;           Referenced in MoveArrowAdr.
82ca: ff fa ff ef ef eb eb ea   .BYTE $ff,$fa,$ff,$ef,$ef,$eb,$eb,$ea  ;   5 byte header:
82d2: ea aa ff ff ff ff ff ff   .BYTE $ea,$aa,$ff,$ff,$ff,$ff,$ff,$ff  ;     0: $18 (24) - Bytes per row (4 chars wide)
82da: ff bf fa fa fa fa fa fa   .BYTE $ff,$bf,$fa,$fa,$fa,$fa,$fa,$fa  ;     1: $03      - Row count
82e2: fa fa aa aa aa aa aa aa   .BYTE $fa,$fa,$aa,$aa,$aa,$aa,$aa,$aa  ;     2: $18      -
82ea: aa aa bf af af ab ab af   .BYTE $aa,$aa,$bf,$af,$af,$ab,$ab,$af  ;     3: $01      -
82f2: af bf fa ff ff ff bf bf   .BYTE $af,$bf,$fa,$ff,$ff,$ff,$bf,$bf  ;     4: $03      -
82fa: bf bf aa ea ea eb eb ef   .BYTE $bf,$bf,$aa,$ea,$ea,$eb,$eb,$ef  ;
8302: ef ff bf ff ff ff ff ff   .BYTE $ef,$ff,$bf,$ff,$ff,$ff,$ff,$ff  ;
830a: ff ff                     .BYTE $ff,$ff                          ;

830c: 18 03 08  MoveArwDwnImg   .BYTE $18,$03,$08                      ; 77 bytes: Move back/down arrow charset image.
830f: 01 05 ab ff ff ff ff ff   .BYTE $01,$05,$ab,$ff,$ff,$ff,$ff,$ff  ;           Referenced in MoveArrowAdr.
8317: ff ff ff ff ff ff aa aa   .BYTE $ff,$ff,$ff,$ff,$ff,$ff,$aa,$aa  ;   5 byte header:
831f: aa aa fa ff ff ff bf bf   .BYTE $aa,$aa,$fa,$ff,$ff,$ff,$bf,$bf  ;     0: $18 (24) - Bytes per row (4 chars wide)
8327: bf bf ff ea ea fa fa fe   .BYTE $bf,$bf,$ff,$ea,$ea,$fa,$fa,$fe  ;     1: $03      - Row count
832f: fe ff aa aa aa aa aa aa   .BYTE $fe,$ff,$aa,$aa,$aa,$aa,$aa,$aa  ;     2: $08      -
8337: aa aa bf aa aa ab ab af   .BYTE $aa,$aa,$bf,$aa,$aa,$ab,$ab,$af  ;     3: $01      -
833f: af bf ff ff ff ff ff ff   .BYTE $af,$bf,$ff,$ff,$ff,$ff,$ff,$ff  ;     4: $05      -
8347: ff ff aa ea ea fb fb ff   .BYTE $ff,$ff,$aa,$ea,$ea,$fb,$fb,$ff  ;
834f: ff ff bf ff ff ff ff ff   .BYTE $ff,$ff,$bf,$ff,$ff,$ff,$ff,$ff  ;
8357: ff ff                     .BYTE $ff,$ff                          ;

8359: 18 03 f8  MoveArwLftImg   .BYTE $18,$03,$f8                      ; 77 bytes: Move left arrow charset image.
835c: 00 03 ff ff ff ff ff ff   .BYTE $00,$03,$ff,$ff,$ff,$ff,$ff,$ff  ;           Referenced in MoveArrowAdr.
8364: ff ff ff fe fe fa fa ea   .BYTE $ff,$ff,$ff,$fe,$fe,$fa,$fa,$ea  ;   5 byte header:
836c: ea aa ff ff ff ff ff ff   .BYTE $ea,$aa,$ff,$ff,$ff,$ff,$ff,$ff  ;     0: $18 (24) - Bytes per row (4 chars wide)
8374: ff ab ff fe fe fa fa fe   .BYTE $ff,$ab,$ff,$fe,$fe,$fa,$fa,$fe  ;     1: $03      - Row count
837c: fe ff aa aa aa aa aa aa   .BYTE $fe,$ff,$aa,$aa,$aa,$aa,$aa,$aa  ;     2: $f8      -
8384: aa aa ab ab ab ab ab ab   .BYTE $aa,$aa,$ab,$ab,$ab,$ab,$ab,$ab  ;     3: $00      -
838c: ab ab ff ff ff ff ff ff   .BYTE $ab,$ab,$ff,$ff,$ff,$ff,$ff,$ff  ;     4: $03      -
8394: ff ff aa ea ea fa fa fe   .BYTE $ff,$ff,$aa,$ea,$ea,$fa,$fa,$fe  ;
839c: fe ff ab ff ff ff ff ff   .BYTE $fe,$ff,$ab,$ff,$ff,$ff,$ff,$ff  ;
83a4: ff ff                     .BYTE $ff,$ff                          ;

83a6: 72 82 0c  MoveArrowAdr    .BYTE $72,$82,$0c          ; 8 bytes: Addresses (LSB/MSB) referenced in sub_7ee4
83a9: 83 59 83 bf 82            .BYTE $83,$59,$83,$bf,$82  ;   0/1: $8272 [MoveArwUpImg]  (Forward/up)
                                                           ;   2/3: $830c [MoveArwDwnImg] (Backward/down)
                                                           ;   4/5: $8359 [MoveArwLftImg] (Left)
                                                           ;   6/7: $82bf [MoveArwRgtImg] (Right)

83ae: 00 00 02  MoveStickMap    .BYTE $00,$00,$02                      ; 16 bytes: Mapping of joystick direction codes
83b1: 00 04 00 02 00 06 00 02   .BYTE $00,$04,$00,$02,$00,$06,$00,$02  ;           to movement arrow address index.
83b9: 00 06 00 02 00            .BYTE $00,$06,$00,$02,$00              ;     0: $00 (Stick centered      -> n/a [F])
                                                                       ;     1: $00 (Stick F             -> Forward)
                                                                       ;     2: $02 (Stick B             -> Backward)
                                                                       ;     3: $00 (Stick F + B         -> n/a [F])
                                                                       ;     4: $04 (Stick L             -> Left)
                                                                       ;     5: $00 (Stick F + L         -> Forward)
                                                                       ;     6: $02 (Stick L + B         -> Backward)
                                                                       ;     7: $00 (Stick F + L + B     -> n/a [F])
                                                                       ;     8: $06 (Stick R             -> Right)
                                                                       ;     9: $00 (Stick F + R         -> Forward)
                                                                       ;    10: $02 (Stick B + R         -> Backward)
                                                                       ;    11: $00 (Stick F + B + R     -> n/a [F])
                                                                       ;    12: $06 (Stick L + R         -> n/a [R])
                                                                       ;    13: $00 (Stick F + L + R     -> n/a [F])
                                                                       ;    14: $02 (Stick L + B + R     -> n/a [B])
                                                                       ;    15: $00 (Stick F + L + B + R -> n/a [F])

83be: bb 84 f0  CmpssArrwAdr    .BYTE $bb,$84,$f0          ; 8 bytes: Addresses (LSB/MSB) of the various compass
83c1: 84 15 85 4a 85            .BYTE $84,$15,$85,$4a,$85  ;          direction arrows based on player orientation.
                                                           ;   0/1: $84bb [CmpssNorthImg] (North)
                                                           ;   2/3: $84f0 [CmpssEastImg]  (East)
                                                           ;   4/5: $8515 [CmpssSouthImg] (South)
                                                           ;   6/7: $854a [CmpssWestImg]  (West)

83c6: 30 05 18  CmpssFrameImg   .BYTE $30,$05,$18                      ; 245 bytes: Empty compass frame charset image
83c9: 00 02 ff ff ff ff ff ff   .BYTE $00,$02,$ff,$ff,$ff,$ff,$ff,$ff  ;   5 byte header:
83d1: fe fe ff ff fe fa ea a8   .BYTE $fe,$fe,$ff,$ff,$fe,$fa,$ea,$a8  ;     0: $30 (48) - Bytes per row
83d9: a0 80 ff ea aa aa 0a 02   .BYTE $a0,$80,$ff,$ea,$aa,$aa,$0a,$02  ;     1: $05      - Row count
83e1: 02 00 ff af aa aa 82 00   .BYTE $02,$00,$ff,$af,$aa,$aa,$82,$00  ;     2: $18 (24) -
83e9: 00 00 ff ff ff bf af ab   .BYTE $00,$00,$ff,$ff,$ff,$bf,$af,$ab  ;     3: $00      -
83f1: 2a 0a ff ff ff ff ff ff   .BYTE $2a,$0a,$ff,$ff,$ff,$ff,$ff,$ff  ;     4: $02      -
83f9: ff ff fa fa ea e8 e8 a8   .BYTE $ff,$ff,$fa,$fa,$ea,$e8,$e8,$a8  ;
8401: a0 a0 80 00 00 00 00 00   .BYTE $a0,$a0,$80,$00,$00,$00,$00,$00  ;
8409: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ;
8411: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ;
8419: 00 00 0a 02 02 00 00 00   .BYTE $00,$00,$0a,$02,$02,$00,$00,$00  ;
8421: 00 00 bf bf af af af ab   .BYTE $00,$00,$bf,$bf,$af,$af,$af,$ab  ;
8429: 2b 2b a0 a0 80 a0 a8 a0   .BYTE $2b,$2b,$a0,$a0,$80,$a0,$a8,$a0  ;
8431: 80 a0 00 00 00 00 00 00   .BYTE $80,$a0,$00,$00,$00,$00,$00,$00  ;
8439: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ;
8441: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ;
8449: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ;
8451: 00 00 2b 0b 0b 2b ab 2b   .BYTE $00,$00,$2b,$0b,$0b,$2b,$ab,$2b  ;
8459: 0b 0b a0 a0 a0 a8 e8 e8   .BYTE $0b,$0b,$a0,$a0,$a0,$a8,$e8,$e8  ;
8461: ea fa 00 00 00 00 00 00   .BYTE $ea,$fa,$00,$00,$00,$00,$00,$00  ;
8469: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ;
8471: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ;
8479: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ;
8481: 02 02 2b 2b 2b ab af af   .BYTE $02,$02,$2b,$2b,$2b,$ab,$af,$af  ;
8489: af bf fa fe fe ff ff ff   .BYTE $af,$bf,$fa,$fe,$fe,$ff,$ff,$ff  ;
8491: ff ff 80 80 a0 a8 ea fa   .BYTE $ff,$ff,$80,$80,$a0,$a8,$ea,$fa  ;
8499: fe ff 00 00 02 02 0a aa   .BYTE $fe,$ff,$00,$00,$02,$02,$0a,$aa  ;
84a1: aa ea 00 00 00 00 82 aa   .BYTE $aa,$ea,$00,$00,$00,$00,$82,$aa  ;
84a9: aa af 0a 0a 2a ab af bf   .BYTE $aa,$af,$0a,$0a,$2a,$ab,$af,$bf  ;
84b1: ff ff bf ff ff ff ff ff   .BYTE $ff,$ff,$bf,$ff,$ff,$ff,$ff,$ff  ;
84b9: ff ff                     .BYTE $ff,$ff                          ;

84bb: 10 03 28  CmpssNorthImg   .BYTE $10,$03,$28                      ; 53 bytes: Compass arrow pointing North
84be: 00 03 02 0a 2a aa 0a 0a   .BYTE $00,$03,$02,$0a,$2a,$aa,$0a,$0a  ;   5 byte header:
84c6: 0a 0a 00 80 a0 a8 80 80   .BYTE $0a,$0a,$00,$80,$a0,$a8,$80,$80  ;     0: $10 (16) - Bytes per row (2 chars wide)
84ce: 80 80 0a 0a 0a 0a 08 0a   .BYTE $80,$80,$0a,$0a,$0a,$0a,$08,$0a  ;     1: $03      - Row count
84d6: 0a 0a 80 80 80 80 80 80   .BYTE $0a,$0a,$80,$80,$80,$80,$80,$80  ;     2: $28 (40) -
84de: 80 80 0a 0a 2a 28 28 28   .BYTE $80,$80,$0a,$0a,$2a,$28,$28,$28  ;     3: $00      -
84e6: 20 20 80 80 a0 a0 a0 a0   .BYTE $20,$20,$80,$80,$a0,$a0,$a0,$a0  ;     4: $03      -
84e9: 20 20                     .BYTE $20,$20                          ;

84f0: 20 01 20  CmpssEastImg    .BYTE $20,$01,$20                      ; 37 bytes: Compass arrow pointing East
84f3: 00 04 00 00 2a 0a 00 0a   .BYTE $00,$04,$00,$00,$2a,$0a,$00,$0a  ;   5 byte header:
84fb: 2a 00 00 00 80 aa a8 aa   .BYTE $2a,$00,$00,$00,$80,$aa,$a8,$aa  ;     0: $20 (32) - Bytes per row (4 chars wide)
8503: 80 00 00 02 02 aa aa aa   .BYTE $80,$00,$00,$02,$02,$aa,$aa,$aa  ;     1: $01      - Row count
850b: 02 02 00 00 80 a0 a8 a0   .BYTE $02,$02,$00,$00,$80,$a0,$a8,$a0  ;     2: $20 (32) -
8513: 80 00                     .BYTE $80,$00                          ;     3: $00      -
                                                                       ;     4: $04      -

8515: 10 03 28  CmpssSouthImg   .BYTE $10,$03,$28                      ; 53 bytes: Compass arrow pointing South
8518: 00 03 20 20 28 28 28 2a   .BYTE $00,$03,$20,$20,$28,$28,$28,$2a  ;   5 byte header:
8520: 0a 0a 20 20 a0 a0 a0 a0   .BYTE $0a,$0a,$20,$20,$a0,$a0,$a0,$a0  ;     0: $10 (16) - Bytes per row (2 chars wide)
8528: 80 80 0a 0a 0a 0a 08 0a   .BYTE $80,$80,$0a,$0a,$0a,$0a,$08,$0a  ;     1: $03      - Row count
8530: 0a 0a 80 80 80 80 80 80   .BYTE $0a,$0a,$80,$80,$80,$80,$80,$80  ;     2: $28 (40) -
8538: 80 80 0a 0a 0a 0a aa 2a   .BYTE $80,$80,$0a,$0a,$0a,$0a,$aa,$2a  ;     3: $00      -
8540: 0a 02 80 80 80 80 a8 a0   .BYTE $0a,$02,$80,$80,$80,$80,$a8,$a0  ;     4: $03      -
8548: 80 00                     .BYTE $80,$00                          ;

854a: 20 01 20  CmpssWestImg    .BYTE $20,$01,$20                      ; 37 bytes: Compass arrow pointing West
854d: 00 04 00 02 0a 2a aa 2a   .BYTE $00,$04,$00,$02,$0a,$2a,$aa,$2a  ;   5 byte header:
8555: 0a 02 00 00 00 aa a8 aa   .BYTE $0a,$02,$00,$00,$00,$aa,$a8,$aa  ;     0: $20 (32) - Bytes per row (4 chars wide)
855d: 00 00 00 00 0a aa a8 aa   .BYTE $00,$00,$00,$00,$0a,$aa,$a8,$aa  ;     1: $01      - Row count
8565: 0a 00 00 00 a0 80 00 80   .BYTE $0a,$00,$00,$00,$a0,$80,$00,$80  ;     2: $20 (32) -
856d: a0 00                     .BYTE $a0,$00                          ;     3: $00      -
                                                                       ;     4: $04      -

856f: a1 85 da  SpclMesgAdrs    .BYTE $a1,$85,$da                      ; 50 bytes: Addresses of the special location
8572: 85 0c 86 40 86 86 86 b9   .BYTE $85,$0c,$86,$40,$86,$86,$86,$b9  ; messages.
857a: 86 f2 86 3b 87 76 87 ae   .BYTE $86,$f2,$86,$3b,$87,$76,$87,$ae  ;    0: $85a1 [StrDPShop]
8582: 87 e9 87 15 88 40 88 6a   .BYTE $87,$e9,$87,$15,$88,$40,$88,$6a  ;    1: $85da [StrRetreatInn]
858a: 88 96 88 c0 88 f9 88 39   .BYTE $88,$96,$88,$c0,$88,$f9,$88,$39  ;    2: $860c [StrDRTavern]
8592: 89 61 89 ad 89 f3 89 2c   .BYTE $89,$61,$89,$ad,$89,$f3,$89,$2c  ;    3: $8640 [StrSmithy]
859a: 8a 62 8a 98 8a c2 8a      .BYTE $8a,$62,$8a,$98,$8a,$c2,$8a      ;    4: $8686 [StrArrowSouth]
                                                                       ;    5: $86b9 [StrBwreDragon]
                                                                       ;    6: $86f2 [StrGauntlet]
                                                                       ;    7: $873b [StrEnchantress]
                                                                       ;    8: $8776 [StrGoBack]
                                                                       ;    9: $87ae [StrNoEscape]
                                                                       ;   10: $87e9 [StrArrowEast]
                                                                       ;   11: $8815 [StrGoblinsOnly]
                                                                       ;   12: $8840 [StrTrollsOnly]
                                                                       ;   13: $8840 [StrTrollsOnly]
                                                                       ;   14: $886a [StrShrnOfMnstr]
                                                                       ;   15: $8896 [StrRunningWatr]
                                                                       ;   16: $88c0 [StrSeekTheLght]
                                                                       ;   17: $88f9 [StrBwreCaverns]
                                                                       ;   18: $8939 [StrUnbrblStnch]
                                                                       ;   19: $8961 [StrChapel]
                                                                       ;   20: $89ad [StrShadowHides]
                                                                       ;   21: $89f3 [StrAllKnwngEye]
                                                                       ;   22: $8a2c [StrPrplePyrmid]
                                                                       ;   23: $8a62 [StrSkullHangs]
                                                                       ;   24: $8a98 [StrElectricity]
                                                                       ;   25: $8ac2 [StrElabratDoor]

85a1: a6 00 01  StrDPShop       .BYTE $a6,$00,$01                      ; {Col 0 Row 1}
85a4: a5                        .BYTE $a5                              ; {Center}
85a5: 41 20 73 69 67 6e 20 6f   .BYTE $41,$20,$73,$69,$67,$6e,$20,$6f  ; "A sign o"
85ad: 6e 20 74 68 65 20 64 6f   .BYTE $6e,$20,$74,$68,$65,$20,$64,$6f  ; "n the do"
85b5: 6f 72 20 73 61 79 73 3a   .BYTE $6f,$72,$20,$73,$61,$79,$73,$3a  ; "or says:"
85bd: 0d 0d                     .BYTE $0d,$0d                          ; "\n\n"
85bf: a5                        .BYTE $a5                              ; {Center}
85c0: 22 44 61 6d 6f 6e 20 26   .BYTE $22,$44,$61,$6d,$6f,$6e,$20,$26  ; ""Damon &"
85c8: 20 50 79 74 68 69 61 73   .BYTE $20,$50,$79,$74,$68,$69,$61,$73  ; " Pythias"
85d0: 20 53 68 6f 70 70 65 22   .BYTE $20,$53,$68,$6f,$70,$70,$65,$22  ; " Shoppe""
85d8: 0d                        .BYTE $0d                              ; "\n"
85d9: ff                        .BYTE $ff                              ; {End of string}

85da: a6 00 01  StrRetreatInn   .BYTE $a6,$00,$01                      ; {Col 0 Row 1}
85dd: a5                        .BYTE $a5                              ; {Center}
85de: 41 20 73 69 67 6e 20 61   .BYTE $41,$20,$73,$69,$67,$6e,$20,$61  ; "A sign a"
85e6: 62 6f 76 65 20 74 68 65   .BYTE $62,$6f,$76,$65,$20,$74,$68,$65  ; "bove the"
85ee: 20 64 6f 6f 72 20 72 65   .BYTE $20,$64,$6f,$6f,$72,$20,$72,$65  ; " door re"
85f6: 61 64 73 3a 0d 0d         .BYTE $61,$64,$73,$3a,$0d,$0d          ; "ads:\n\n"
85fc: a5                        .BYTE $a5                              ; {Center}
85fd: 22 54 48 45 20 52 45 54   .BYTE $22,$54,$48,$45,$20,$52,$45,$54  ; ""THE RET"
8605: 52 45 41 54 22 0d         .BYTE $52,$45,$41,$54,$22,$0d          ; "REAT"\n"
860b: ff                        .BYTE $ff                              ; {End of string}

860c: a6 00 01  StrDRTavern     .BYTE $a6,$00,$01                      ; {Col 0 Row 1}
860f: a5                        .BYTE $a5                              ; {Center}
8610: 41 20 73 69 67 6e 20 72   .BYTE $41,$20,$73,$69,$67,$6e,$20,$72  ; "A sign r"
8618: 65 61 64 73 3a 0d 0d      .BYTE $65,$61,$64,$73,$3a,$0d,$0d      ; "eads:\n\n"
861f: a5                        .BYTE $a5                              ; {Center}
8620: 22 44 65 72 20 52 61 74   .BYTE $22,$44,$65,$72,$20,$52,$61,$74  ; ""Der Rat"
8628: 68 73 6b 65 6c 6c 65 72   .BYTE $68,$73,$6b,$65,$6c,$6c,$65,$72  ; "hskeller"
8630: 20 42 61 72 20 26 20 47   .BYTE $20,$42,$61,$72,$20,$26,$20,$47  ; " Bar & G"
8638: 72 69 6c 6c 65 22 0d      .BYTE $72,$69,$6c,$6c,$65,$22,$0d      ; "rille"\n"
863f: ff                        .BYTE $ff                              ; {End of string}

8640: a6 00 01  StrSmithy       .BYTE $a6,$00,$01                      ; {Col 0 Row 1}
8643: a5                        .BYTE $a5
8644: 43 61 72 76 65 64 20 61   .BYTE $43,$61,$72,$76,$65,$64,$20,$61  ; "Carved a"
864c: 62 6f 76 65 20 74 68 65   .BYTE $62,$6f,$76,$65,$20,$74,$68,$65  ; "bove the"
8654: 20 64 6f 6f 72 77 61 79   .BYTE $20,$64,$6f,$6f,$72,$77,$61,$79  ; " doorway"
865c: 20 61 72 65 20 74 68 65   .BYTE $20,$61,$72,$65,$20,$74,$68,$65  ; " are the"
8664: 20 77 6f 72 64 73 3a 0d   .BYTE $20,$77,$6f,$72,$64,$73,$3a,$0d  ; " words:\n"
866c: 0d                        .BYTE $0d                              ; "\n"
866d: a5                        .BYTE $a5                              ; {Center}
866e: 22 46 69 6e 65 20 57 65   .BYTE $22,$46,$69,$6e,$65,$20,$57,$65  ; ""Fine We"
8676: 61 70 6f 6e 73 20 26 20   .BYTE $61,$70,$6f,$6e,$73,$20,$26,$20  ; "apons & "
867e: 41 72 6d 6f 72 22 0d      .BYTE $41,$72,$6d,$6f,$72,$22,$0d      ; "Armor"\n"
8685: ff                        .BYTE $ff                              ; {End of string}

8686: a6 00 01  StrArrowSouth   .BYTE $a6,$00,$01                      ; {Col 0 Row 1}
8689: a5                        .BYTE $a5                              ; {Center}
868a: 41 6e 20 61 72 72 6f 77   .BYTE $41,$6e,$20,$61,$72,$72,$6f,$77  ; "An arrow"
8692: 20 70 61 69 6e 74 65 64   .BYTE $20,$70,$61,$69,$6e,$74,$65,$64  ; " painted"
869a: 20 6f 6e 20 74 68 65 20   .BYTE $20,$6f,$6e,$20,$74,$68,$65,$20  ; " on the "
86a2: 66 6c 6f 6f 72 0d 0d      .BYTE $66,$6c,$6f,$6f,$72,$0d,$0d      ; "floor\n\n
86a9: a5                        .BYTE $a5                              ; {Center}
86aa: 70 6f 69 6e 74 73 20 53   .BYTE $70,$6f,$69,$6e,$74,$73,$20,$53  ; "points S"
86b2: 6f 75 74 68 2e 0d         .BYTE $6f,$75,$74,$68,$2e,$0d          ; "outh.\n"
86b8: ff                        .BYTE $ff                              ; {End of string}

86b9: a6 00 01  StrBwreDragon   .BYTE $a6,$00,$01                      ; {Col 0 Row 1}
86bc: a5                        .BYTE $a5                              ; {Center}
86bd: 57 72 69 74 69 6e 67 20   .BYTE $57,$72,$69,$74,$69,$6e,$67,$20  ; "Writing "
86c5: 6f 6e 20 74 68 65 20 77   .BYTE $6f,$6e,$20,$74,$68,$65,$20,$77  ; "on the w"
86cd: 61 6c 6c 20 73 61 79 73   .BYTE $61,$6c,$6c,$20,$73,$61,$79,$73  ; "all says"
86d5: 3a 0d 0d                  .BYTE $3a,$0d,$0D                      ; ":\n\n"
86d8: a5                        .BYTE $a5                              ; {Center}
86d9: 22 42 45 57 41 52 45 20   .BYTE $22,$42,$45,$57,$41,$52,$45,$20  ; ""BEWARE "
86e1: 4f 46 20 54 48 45 20 44   .BYTE $4f,$46,$20,$54,$48,$45,$20,$44  ; "OF THE D"
86e9: 52 41 47 4f 4e 21 22 0d   .BYTE $52,$41,$47,$4f,$4e,$21,$22,$0d  ; "RAGON!"\n"
86f1: ff                        .BYTE $ff                              ; {End of string}

86f2: a6 00 01  StrGauntlet     .BYTE $a6,$00,$01                      ; {Col 0 Row 1}
86f5: a5                        .BYTE $a5                              ; {Center}
86f6: 57 72 69 74 69 6e 67 20   .BYTE $57,$72,$69,$74,$69,$6e,$67,$20  ; "Writing "
86fe: 63 61 72 76 65 64 20 69   .BYTE $63,$61,$72,$76,$65,$64,$20,$69  ; "carved i"
8706: 6e 74 6f 20 74 68 65 20   .BYTE $6e,$74,$6f,$20,$74,$68,$65,$20  ; "nto the "
870e: 64 6f 6f 72 20 72 65 61   .BYTE $64,$6f,$6f,$72,$20,$72,$65,$61  ; "door rea"
8716: 64 73 3a 0d 0d            .BYTE $64,$73,$3a,$0d,$0d              ; "ds:\n\n"
871b: a5                        .BYTE $a5                              ; {Center}
871c: 22 54 48 45 20 47 41 55   .BYTE $22,$54,$48,$45,$20,$47,$41,$55  ; ""THE GAU"
8724: 4e 54 4c 45 54 0d         .BYTE $4e,$54,$4c,$45,$54,$0d          ; "NTLET\n"
872a: a5                        .BYTE $a5                              ; {Center}
872b: 20 44 4f 20 4e 4f 54 20   .BYTE $20,$44,$4f,$20,$4e,$4f,$54,$20  ; " DO NOT "
8733: 45 4e 54 45 52 22 0d      .BYTE $45,$4e,$54,$45,$52,$22,$0d      ; "ENTER"\n"
873a: ff                        .BYTE $ff                              ; {End of string}

873b: a6 00 01  StrEnchantress  .BYTE $a6,$00,$01                      ; {Col 0 Row 1}
873e: a5                        .BYTE $a5                              ; {Center}
873f: 47 6c 6f 77 69 6e 67 20   .BYTE $47,$6c,$6f,$77,$69,$6e,$67,$20  ; "Glowing "
8747: 6c 65 74 74 65 72 73 20   .BYTE $6c,$65,$74,$74,$65,$72,$73,$20  ; "letters "
874f: 6f 6e 20 74 68 65 20 64   .BYTE $6f,$6e,$20,$74,$68,$65,$20,$64  ; "on the d"
8757: 6f 6f 72 20 70 72 6f 63   .BYTE $6f,$6f,$72,$20,$70,$72,$6f,$63  ; "oor proc"
875f: 6c 61 69 6d 3a 0d 0d      .BYTE $6c,$61,$69,$6d,$3a,$0d,$0d      ; "laim:\n\n"
8766: a5                        .BYTE $a5                              ; {Center}
8767: 22 45 6e 63 68 61 6e 74   .BYTE $22,$45,$6e,$63,$68,$61,$6e,$74  ; ""Enchant"
876f: 72 65 73 73 22 0d         .BYTE $72,$65,$73,$73,$22,$0d          ; "ress"\n"
8775: ff                        .BYTE $ff                              ; {End of string}

8776: a6 00 01  StrGoBack       .BYTE $a6,$00,$01                      ; {Col 0 Row 1}
8779: a5                        .BYTE $a5                              ; {Center}
877a: 57 72 69 74 69 6e 67 20   .BYTE $57,$72,$69,$74,$69,$6e,$67,$20  ; "Writing "
8782: 73 63 72 61 77 6c 65 64   .BYTE $73,$63,$72,$61,$77,$6c,$65,$64  ; "scrawled"
878a: 20 6f 6e 20 74 68 65 20   .BYTE $20,$6f,$6e,$20,$74,$68,$65,$20  ; " on the "
8792: 67 72 6f 75 6e 64 20 72   .BYTE $67,$72,$6f,$75,$6e,$64,$20,$72  ; "ground r"
879a: 65 61 64 73 3a 0d 0d      .BYTE $65,$61,$64,$73,$3a,$0d,$0d      ; "eads:\n\n"
87a1: a5                        .BYTE $a5                              ; {Center}
87a2: 22 47 4f 20 42 41 43 4b   .BYTE $22,$47,$4f,$20,$42,$41,$43,$4b  ; ""GO BACK"
87aa: 21 22 0d                  .BYTE $21,$22,$0d                      ; "!"\n"
87ad: ff                        .BYTE $ff                              ; {End of string}

87ae: a6 00 01  StrNoEscape     .BYTE $a6,$00,$01                      ; {Col 0 Row 1}
87b1: a5                        .BYTE $a5                              ; {Center}
87b2: 53 63 72 61 74 63 68 69   .BYTE $53,$63,$72,$61,$74,$63,$68,$69  ; "Scratchi"
87ba: 6e 67 73 20 6f 6e 20 74   .BYTE $6e,$67,$73,$20,$6f,$6e,$20,$74  ; "ngs on t"
87c2: 68 65 20 77 61 6c 6c 74   .BYTE $68,$65,$20,$77,$61,$6c,$6c,$20  ; "he wall "
87ca: 72 65 61 64 3a 0d 0d      .BYTE $72,$65,$61,$64,$3a,$0d,$0d      ; "read:\n\n"
87d1: a5                        .BYTE $a5                              ; {Center}
87d2: 22 54 48 45 52 45 20 49   .BYTE $22,$54,$48,$45,$52,$45,$20,$49  ; ""THERE I"
87da: 53 20 4e 4f 20 45 53 43   .BYTE $53,$20,$4e,$4f,$20,$45,$53,$43  ; "S NO ESC"
87e2: 41 50 45 21 22 0d         .BYTE $41,$50,$45,$21,$22,$0d          ; "APE!"\n"
87e8: ff                        .BYTE $ff                              ; {End of string}

87e9: a6 00 02  StrArrowEast    .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
87ec: a5                        .BYTE $a5                              ; {Center}
87ed: 41 20 72 65 64 20 61 72   .BYTE $41,$20,$72,$65,$64,$20,$61,$72  ; "A red ar"
87f5: 72 6f 77 20 6f 6e 20 74   .BYTE $72,$6f,$77,$20,$6f,$6e,$20,$74  ; "row on t"
87fd: 68 65 20 67 72 6f 75 6e   .BYTE $68,$65,$20,$67,$72,$6f,$75,$6e  ; "he groun"
8805: 64 20 70 6f 69 6e 74 73   .BYTE $64,$20,$70,$6f,$69,$6e,$74,$73  ; "d points"
880d: 20 45 61 73 74 2e 0d      .BYTE $20,$45,$61,$73,$74,$2e,$0d      ; " East.\n"
8814: ff                        .BYTE $ff                              ; {End of string}

8815: a6 00 01  StrGoblinsOnly  .BYTE $a6,$00,$01                      ; {Col 0 Row 1}
8818: a5                        .BYTE $a5                              ; {Center}
8819: 41 20 64 69 72 74 79 20   .BYTE $41,$20,$64,$69,$72,$74,$79,$20  ; "A dirty "
8821: 73 69 67 6e 20 72 65 61   .BYTE $73,$69,$67,$6e,$20,$72,$65,$61  ; "sign rea"
8829: 64 73 3a 0d 0d            .BYTE $64,$73,$3a,$0d,$0d              ; "ds:\n\n"
883e: a5                        .BYTE $a5                              ; {Center}
883f: 22 47 6f 62 6c 69 6e 73   .BYTE $22,$47,$6f,$62,$6c,$69,$6e,$73  ; "Goblins
8837: 20 6f 6e 6c 79 21 22 0d   .BYTE $20,$6f,$6e,$6c,$79,$21,$22,$0d  ; only!"\n
883f: ff                        .BYTE $ff                              ; {End of string}

8840: a6 00 01  StrTrollsOnly   .BYTE $a6,$00,$01                      ; {Col 0 Row 1}
8843: a5                        .BYTE $a5                              ; {Center}
8844: 41 20 63 72 6f 6f 6b 65   .BYTE $41,$20,$63,$72,$6f,$6f,$6b,$65  ; "A crooke"
884c: 64 20 73 69 67 6e 20 73   .BYTE $64,$20,$73,$69,$67,$6e,$20,$73  ; "d sign s"
8854: 61 79 73 3a 0d 0d         .BYTE $61,$79,$73,$3a,$0d,$0d          ; "ays:\n\n"
885c: a5                        .BYTE $a5                              ; {Center}
885b: 22 54 52 4f 4c 4c 53 20   .BYTE $22,$54,$52,$4f,$4c,$4c,$53,$20  ; ""TROLLS"
8863: 4f 4e 4c 59 22 0d         .BYTE $4f,$4e,$4c,$59,$22,$0d          ; "ONLY"\n"
8869: ff                        .BYTE $ff                              ; {End of string}

886a: a6 00 01  StrShrnOfMnstr  .BYTE $a6,$00,$01                      ; {Col 0 Row 1}
8843: a5                        .BYTE $a5                              ; {Center}
886e: 41 20 70 6c 61 71 75 65   .BYTE $41,$20,$70,$6c,$61,$71,$75,$65  ; "A plaque"
8876: 20 72 65 61 64 73 3a 0d   .BYTE $20,$72,$65,$61,$64,$73,$3a,$0d  ; " reads:\n"
887e: 0d                        .BYTE $0d                              ; "\n"
887f: a5                        .BYTE $a5                              ; {Center}
8880: 22 53 68 72 69 6e 65 20   .BYTE $22,$53,$68,$72,$69,$6e,$65,$20  ; ""Shrine "
8888: 6f 66 20 4d 6f 6e 73 74   .BYTE $6f,$66,$20,$4d,$6f,$6e,$73,$74  ; "of Monst"
8890: 65 72 73 22 0d            .BYTE $65,$72,$73,$22,$0d              ; "ers"\n"
8895: ff                        .BYTE $ff                              ; {End of string}

8896: a6 00 02  StrRunningWatr  .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
8899: a5                        .BYTE $a5                              ; {Center}
889a: 59 6f 75 20 68 65 61 72   .BYTE $59,$6f,$75,$20,$68,$65,$61,$72  ; "You hear"
88a2: 20 74 68 65 20 73 6f 75   .BYTE $20,$74,$68,$65,$20,$73,$6f,$75  ; " the sou"
88aa: 6e 64 20 6f 66 20 72 75   .BYTE $6e,$64,$20,$6f,$66,$20,$72,$75  ; "nd of ru"
88b2: 6e 6e 69 6e 67 20 77 61   .BYTE $6e,$6e,$69,$6e,$67,$20,$77,$61  ; "nning wa"
88ba: 74 65 72 2e 0d            .BYTE $74,$65,$72,$2e,$0d              ; "ter.\n"
88bf: ff                        .BYTE $ff                              ; {End of string}

88c0: a6 00 01  StrSeekTheLght  .BYTE $a6,$00,$01                      ; {Col 0 Row 1}
88c3: a5                        .BYTE $a5                              ; {Center}
88c4: 47 6c 6f 77 69 6e 67 20   .BYTE $47,$6c,$6f,$77,$69,$6e,$67,$20  ; "Glowing "
88cc: 6c 65 74 74 65 72 73 20   .BYTE $6c,$65,$74,$74,$65,$72,$73,$20  ; "letters "
88d4: 66 6c 6f 61 74 20 69 6e   .BYTE $66,$6c,$6f,$61,$74,$20,$69,$6e  ; "float in"
88dc: 20 6d 69 64 61 69 72 3a   .BYTE $20,$6d,$69,$64,$61,$69,$72,$3a  ; " midair:"
88e4: 0d 0d                     .BYTE $0d,$0d                          ; "\n\n"
88e6: a5                        .BYTE $a5                              ; {Center}
88e7: 22 53 45 45 4b 20 54 48   .BYTE $22,$53,$45,$45,$4b,$20,$54,$48  ; ""SEEK TH"
88ef: 45 20 4c 49 47 48 54 22   .BYTE $45,$20,$4c,$49,$47,$48,$54,$22  ; "E LIGHT""
88f7: 0d                        .BYTE $0d                              ; "\n"
88f8: ff                        .BYTE $ff                              ; {End of string}

88f9: a6 00 01  StrBwreCaverns  .BYTE $a6,$00,$01                      ; {Col 0 Row 1}
88fc: a5                        .BYTE $a5                              ; {Center}
88fd: 41 20 6e 6f 74 65 20 70   .BYTE $41,$20,$6e,$6f,$74,$65,$20,$70  ; "A note p"
8905: 6f 73 74 65 64 20 6f 6e   .BYTE $6f,$73,$74,$65,$64,$20,$6f,$6e  ; "osted on"
890d: 20 74 68 65 20 64 6f 6f   .BYTE $20,$74,$68,$65,$20,$64,$6f,$6f  ; " the doo"
8915: 72 20 72 65 61 64 73 3a   .BYTE $72,$20,$72,$65,$61,$64,$73,$3a  ; "r reads:"
891d: 0d 0d                     .BYTE $0d,$0d                          ; "\n\n"
891f: a5                        .BYTE $a5                              ; {Center}
8920: 22 42 45 57 41 52 45 21   .BYTE $22,$42,$45,$57,$41,$52,$45,$21  ; ""BEWARE!"
8928: 20 20 54 48 45 20 43 41   .BYTE $20,$20,$54,$48,$45,$20,$43,$41  ; "  THE CA"
8930: 56 45 52 4e 53 21 22 0d   .BYTE $56,$45,$52,$4e,$53,$21,$22,$0d  ; "VERNS!"\n"
8938: ff                        .BYTE $ff                              ; {End of string}

8939: a6 00 02  StrUnbrblStnch  .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
893c: a5                        .BYTE $a5                              ; {Center}
893d: 54 68 65 20 73 74 65 6e   .BYTE $54,$68,$65,$20,$73,$74,$65,$6e  ; "The sten"
8945: 63 68 20 69 73 20 62 65   .BYTE $63,$68,$20,$69,$73,$20,$62,$65  ; "ch is be"
894d: 63 6f 6d 69 6e 67 20 75   .BYTE $63,$6f,$6d,$69,$6e,$67,$20,$75  ; "coming u"
8955: 6e 62 65 61 72 61 62 6c   .BYTE $6e,$62,$65,$61,$72,$61,$62,$6c  ; "nbearabl"
895d: 65 2e 0d                  .BYTE $65,$2e,$0d                      ; "e.\n"
8960: ff                        .BYTE $ff                              ; {End of string}

8961: a6 00 01  StrChapel       .BYTE $a6,$00,$01                      ; {Col 0 Row 1}
8964: a5                        .BYTE $a5                              ; {Center}
8965: 41 20 73 69 67 6e 20 61   .BYTE $41,$20,$73,$69,$67,$6e,$20,$61  ; "A sign a"
896d: 62 6f 76 65 20 74 68 65   .BYTE $62,$6f,$76,$65,$20,$74,$68,$65  ; "bove the"
8975: 20 64 6f 6f 72 20 73 61   .BYTE $20,$64,$6f,$6f,$72,$20,$73,$61  ; " door sa"
897d: 79 73 3a 0d 0d            .BYTE $79,$73,$3a,$0d,$0d              ; "ys:\n\n"
8982: a5                        .BYTE $a5                              ; {Center}
8983: 22 57 65 6c 63 6f 6d 65   .BYTE $22,$57,$65,$6c,$63,$6f,$6d,$65  ; "Welcome"
898b: 20 74 6f 20 74 68 65 20   .BYTE $20,$74,$6f,$20,$74,$68,$65,$20  ; " to the "
8993: 43 68 61 70 65 6c 2e 20   .BYTE $43,$68,$61,$70,$65,$6c,$2e,$20  ; "Chapel. "
899b: 50 6c 65 61 73 65 20 63   .BYTE $50,$6c,$65,$61,$73,$65,$20,$63  ; "Please c"
89a3: 6f 6d 65 20 69 6e 21 22   .BYTE $6f,$6d,$65,$20,$69,$6e,$21,$22  ; "ome in!""
89ab: 0d                        .BYTE $0d                              ; "\n"
89ac: ff                        .BYTE $ff                              ; {End of string}

89ad: a6 00 01  StrShadowHides  .BYTE $a6,$00,$01                      ; {Col 0 Row 1}
89b0: a5                        .BYTE $a5                              ; {Center}
89b1: 42 6c 61 63 6b 20 6c 65   .BYTE $42,$6c,$61,$63,$6b,$20,$6c,$65  ; "Black le"
89b9: 74 74 65 72 73 20 68 6f   .BYTE $74,$74,$65,$72,$73,$20,$68,$6f  ; "tters ho"
89c1: 76 65 72 69 6e 67 20 73   .BYTE $76,$65,$72,$69,$6e,$67,$20,$73  ; "vering s"
89c9: 6c 6f 77 6c 79 20 73 61   .BYTE $6c,$6f,$77,$6c,$79,$20,$73,$61  ; "alowly s"
89d1: 79 3a 0d 0d               .BYTE $79,$3a,$0d,$0d                  ; "y:\n\n"
89d5: a5                        .BYTE $a5                              ; {Center}
89d6: 22 54 48 45 20 53 48 41   .BYTE $22,$54,$48,$45,$20,$53,$48,$41  ; ""THE SHA"
89de: 44 4f 57 20 57 49 4c 4c   .BYTE $44,$4f,$57,$20,$57,$49,$4c,$4c  ; "DOW WILL"
89e6: 20 48 49 44 45 20 54 48   .BYTE $20,$48,$49,$44,$45,$20,$54,$48  ; " HIDE TH"
89ee: 45 45 22 0d               .BYTE $45,$45,$22,$0d                  ; "EE"\n"
89f2: ff                        .BYTE $ff                              ; {End of string}

89f3: a6 00 01  StrAllKnwngEye  .BYTE $a6,$00,$01                      ; {Col 0 Row 1}
89f6: a5                        .BYTE $a5                              ; {Center}
89f7: 54 68 65 20 72 75 6e 65   .BYTE $54,$68,$65,$20,$72,$75,$6e,$65  ; "The rune"
89ff: 20 6f 66 20 74 68 65 20   .BYTE $20,$6f,$66,$20,$74,$68,$65,$20  ; " of the "
8a07: 61 6c 6c 2d 6b 6e 6f 77   .BYTE $61,$6c,$6c,$2d,$6b,$6e,$6f,$77  ; "all-know"
8a0f: 69 6e 67 20 65 79 65 20   .BYTE $69,$6e,$67,$20,$65,$79,$65,$20  ; "ing eye "
8a17: 69 73 20 75 70 6f 6e 0d   .BYTE $69,$73,$20,$75,$70,$6f,$6e,$0d  ; "is upon\n"
8a1f: 0d                        .BYTE $0d                              ; "\n"
8920: a5                        .BYTE $a5                              ; {Center}
8a21: 74 68 65 20 64 6f 6f 72   .BYTE $74,$68,$65,$20,$64,$6f,$6f,$72  ; "the door"
8a29: 2e 0d                     .BYTE $2e,$0d                          ; ".\n"
8a2b: ff                        .BYTE $ff                              ; {End of string}

8a2c: a6 00 01  StrPrplePyrmid  .BYTE $a6,$00,$01                      ; {Col 0 Row 1}
8a2f: a5                        .BYTE $a5                              ; {Center}
8a30: 4f 6e 20 74 68 65 20 77   .BYTE $4f,$6e,$20,$74,$68,$65,$20,$77  ; "On the w"
8a38: 61 6c 6c 20 69 73 20 61   .BYTE $61,$6c,$6c,$20,$69,$73,$20,$61  ; "all is a"
8a40: 20 70 61 69 6e 74 69 6e   .BYTE $20,$70,$61,$69,$6e,$74,$69,$6e  ; " paintin"
8a48: 67 20 6f 66 0d 0d         .BYTE $67,$20,$6f,$66,$0d,$0d          ; "g of\n\n"
8a4e: a5                        .BYTE $a5                              ; {Center}
8a4f: 61 20 70 75 72 70 6c 65   .BYTE $61,$20,$70,$75,$72,$70,$6c,$65  ; "a purple"
8a57: 20 70 79 72 61 6d 69 64   .BYTE $20,$70,$79,$72,$61,$6d,$69,$64  ; " pyramid"
8a5f: 2e 0d                     .BYTE $2e,$0d                          ; ".\n"
8a61: ff                        .BYTE $ff                              ; {End of string}

8a62: a6 00 01  StrSkullHangs   .BYTE $a6,$00,$01                      ; {Col 0 Row 1}
8a65: a5                        .BYTE $a5                              ; {Center}
8a66: 41 20 73 6b 75 6c 6c 20   .BYTE $41,$20,$73,$6b,$75,$6c,$6c,$20  ; "A skull "
8a6e: 68 61 6e 67 73 20 66 72   .BYTE $68,$61,$6e,$67,$73,$20,$66,$72  ; "hangs fr"
8a76: 6f 6d 20 74 68 65 20 63   .BYTE $6f,$6d,$20,$74,$68,$65,$20,$63  ; "om the c"
8a7e: 65 69 6c 69 6e 67 0d 0d   .BYTE $65,$69,$6c,$69,$6e,$67,$0d,$0d  ; "eiling\n\n"
8a66: a5                        .BYTE $a5                              ; {Center}
8a87: 61 62 6f 76 65 20 74 68   .BYTE $61,$62,$6f,$76,$65,$20,$74,$68  ; "above th"
8a8f: 65 20 64 6f 6f 72 2e 0d   .BYTE $65,$20,$64,$6f,$6f,$72,$2e,$0d  ; "e door.\n"
8a97: ff                        .BYTE $ff                              ; {End of string}

8a98: a6 00 02  StrElectricity  .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
8a9b: a5                        .BYTE $a5                              ; {Center}
8a9c: 59 6f 75 20 68 65 61 72   .BYTE $59,$6f,$75,$20,$68,$65,$61,$72  ; "You hear"
8aa4: 20 74 68 65 20 63 72 61   .BYTE $20,$74,$68,$65,$20,$63,$72,$61  ; " the cra"
8aac: 63 6b 6c 65 20 6f 66 20   .BYTE $63,$6b,$6c,$65,$20,$6f,$66,$20  ; "ckle of "
8ab4: 65 6c 65 63 74 72 69 63   .BYTE $65,$6c,$65,$63,$74,$72,$69,$63  ; "electric"
8abc: 69 74 79 2e 0d            .BYTE $69,$74,$79,$2e,$0d              ; ity.\n
8ac1: ff                        .BYTE $ff                              ; {End of string}

8ac2: a6 00 02  StrElabratDoor  .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
8ac5: a5                        .BYTE $a5                              ; {Center}
8ac6: 59 6f 75 20 73 74 61 6e   .BYTE $59,$6f,$75,$20,$73,$74,$61,$6e  ; "You stan"
8ace: 64 20 62 65 66 6f 72 65   .BYTE $64,$20,$62,$65,$66,$6f,$72,$65  ; "d before"
8ad6: 20 61 6e 20 65 6c 61 62   .BYTE $20,$61,$6e,$20,$65,$6c,$61,$62  ; " an elab"
8ade: 6f 72 61 74 65 20 64 6f   .BYTE $6f,$72,$61,$74,$65,$20,$64,$6f  ; "orate do"
8ae6: 6f 72 2e 0d               .BYTE $6f,$72,$2e,$0d                  ; "or.\n"
8aea: ff                        .BYTE $ff                              ; {End of string}

8aeb: 00 08 10  Mul8Tbl         .BYTE $00,$08,$10                      ; 18 bytes: Indexes into the bytes referenced by
8aee: 18 20 28 30 38 40 48 50   .BYTE $18,$20,$28,$30,$38,$40,$48,$50  ;           the addresses in dat_7fc5_L/H
8af6: 58 60 68 70 78 80 88      .BYTE $58,$60,$68,$70,$78,$80,$88      ; Holds multiples of 8:
                                                                       ;   0: $00 (0)       9: $48 (72)
                                                                       ;   1: $08 (8)      10: $50 (80)
                                                                       ;   2: $10 (16)     11: $58 (88)
                                                                       ;   3: $18 (24)     12: $60 (96)
                                                                       ;   4: $20 (32)     13: $68 (104)
                                                                       ;   5: $28 (40)     14: $70 (112)
                                                                       ;   6: $30 (48)     15: $78 (120)
                                                                       ;   7: $38 (56)     16: $80 (128)
                                                                       ;   8: $40 (64)     17: $88 (136)

8afd: 7b 8d 9f  dat_8afd_L      .BYTE $7b,$8d,$9f                      ; 72 bytes: LSB of source address to copy from
8b00: b1 c3 d5 e7 f9 0b 1d 2f   .BYTE $b1,$c3,$d5,$e7,$f9,$0b,$1d,$2f  ;          (copyFrameBuf: assigns to smc_7875[1])
8b08: 41 53 65 77 89 9b ad bf   .BYTE $41,$53,$65,$77,$89,$9b,$ad,$bf  ;
8b10: d1 e3 f5 07 19 2b 3d 4f   .BYTE $d1,$e3,$f5,$07,$19,$2b,$3d,$4f  ;
8b18: 61 73 85 97 a9 bb cd df   .BYTE $61,$73,$85,$97,$a9,$bb,$cd,$df  ;
8b20: f1 03 15 27 39 4b 5d 6f   .BYTE $f1,$03,$15,$27,$39,$4b,$5d,$6f  ;
8b28: 81 93 a5 b7 c9 db ed ff   .BYTE $81,$93,$a5,$b7,$c9,$db,$ed,$ff  ;
8b30: 11 23 35 47 59 6b 7d 8f   .BYTE $11,$23,$35,$47,$59,$6b,$7d,$8f  ;
8b38: a1 b3 c5 d7 e9 fb 0d 1f   .BYTE $a1,$b3,$c5,$d7,$e9,$fb,$0d,$1f  ;
8b40: 31 43 55 67 79            .BYTE $31,$43,$55,$67,$79              ;

8b45: 8f 8f 8f  dat_8afd_H      .BYTE $8f,$8f,$8f                      ; 72 bytes: MSB of source address to copy from
8b48: 8f 8f 8f 8f 8f 90 90 90   .BYTE $8f,$8f,$8f,$8f,$8f,$90,$90,$90  ;          (copyFrameBuf: assigns to smc_7875[2])
8b50: 90 90 90 90 90 90 90 90   .BYTE $90,$90,$90,$90,$90,$90,$90,$90  ;   0: $8f7b [src_8f7b]
8b58: 90 90 90 91 91 91 91 91   .BYTE $90,$90,$90,$91,$91,$91,$91,$91  ;   1: $8f8d [src_8f8d]
8b60: 91 91 91 91 91 91 91 91   .BYTE $91,$91,$91,$91,$91,$91,$91,$91  ;   2: $8f9f [src_8f9f]
8b68: 91 92 92 92 92 92 92 92   .BYTE $91,$92,$92,$92,$92,$92,$92,$92  ;   3: $8fb1 [src_8fb1]
8b70: 92 92 92 92 92 92 92 92   .BYTE $92,$92,$92,$92,$92,$92,$92,$92  ;   4: $8fc3 [src_8fc3]
8b78: 93 93 93 93 93 93 93 93   .BYTE $93,$93,$93,$93,$93,$93,$93,$93  ;   5: $8fd5 [src_8fd5]
8b80: 93 93 93 93 93 93 94 94   .BYTE $93,$93,$93,$93,$93,$93,$94,$94  ;   6: $8fe7 [src_8fe7]
8b88: 94 94 94 94 94            .BYTE $94,$94,$94,$94,$94              ;   7: $8ff9 [src_8ff9]
                                                                       ;   8: $900b [src_900b]
                                                                       ;   9: $901d [src_901d]
                                                                       ;  10: $902f [src_902f]
                                                                       ;  11: $9041 [src_9041]
                                                                       ;  12: $9053 [src_9053]
                                                                       ;  13: $9065 [src_9065]
                                                                       ;  14: $9077 [src_9077]
                                                                       ;  15: $9089 [src_9089]
                                                                       ;  16: $909b [src_909b]
                                                                       ;  17: $90ad [src_90ad]
                                                                       ;  18: $90bf [src_90bf]
                                                                       ;  19: $90d1 [src_90d1]
                                                                       ;  20: $90e3 [src_90e3]
                                                                       ;  21: $90f5 [src_90f5]
                                                                       ;  22: $9107 [src_9107]
                                                                       ;  23: $9119 [src_9119]
                                                                       ;
                                                                       ;  24: $912b [src_912b]
                                                                       ;  25: $913d [src_913d]
                                                                       ;  26: $914f [src_914f]
                                                                       ;  27: $9161 [src_9161]
                                                                       ;  28: $9173 [src_9173]
                                                                       ;  29: $9185 [src_9185]
                                                                       ;  30: $9197 [src_9197]
                                                                       ;  31: $91a9 [src_91a9]
                                                                       ;  32: $91bb [src_91bb]
                                                                       ;  33: $91cd [src_91cd]
                                                                       ;  34: $91df [src_91df]
                                                                       ;  35: $91f1 [src_91f1]
                                                                       ;  36: $9203 [src_9203]
                                                                       ;  37: $9215 [src_9215]
                                                                       ;  38: $9227 [src_9227]
                                                                       ;  39: $9239 [src_9239]
                                                                       ;  40: $924b [src_924b]
                                                                       ;  41: $925d [src_925d]
                                                                       ;  42: $926f [src_926f]
                                                                       ;  43: $9281 [src_9281]
                                                                       ;  44: $9293 [src_9293]
                                                                       ;  45: $92a5 [src_92a5]
                                                                       ;  46: $92b7 [src_92b7]
                                                                       ;  47: $92c9 [src_92c9]
                                                                       ;
                                                                       ;  48: $92db [src_92db]
                                                                       ;  49: $92ed [src_92ed]
                                                                       ;  50: $92ff [src_92ff]
                                                                       ;  51: $9311 [src_9311]
                                                                       ;  52: $9323 [src_9323]
                                                                       ;  53: $9335 [src_9335]
                                                                       ;  54: $9347 [src_9347]
                                                                       ;  55: $9359 [src_9359]
                                                                       ;  56: $936b [src_936b]
                                                                       ;  57: $937d [src_937d]
                                                                       ;  58: $938f [src_938f]
                                                                       ;  59: $93a1 [src_93a1]
                                                                       ;  60: $93b3 [src_93b3]
                                                                       ;  61: $93c5 [src_93c5]
                                                                       ;  62: $93d7 [src_93d7]
                                                                       ;  63: $93e9 [src_93e9]
                                                                       ;  64: $93fb [src_93fb]
                                                                       ;  65: $940d [src_940d]
                                                                       ;  66: $941f [src_941f]
                                                                       ;  67: $9431 [src_9431]
                                                                       ;  68: $9443 [src_9443]
                                                                       ;  69: $9455 [src_9455]
                                                                       ;  70: $9467 [src_9467]
                                                                       ;  71: $9479 [src_9479]

8b8d: c0 30 0c  dat_8b8d        .BYTE $c0,$30,$0c    ; .0.
8b90: 03                        .BYTE $03            ; .

8b91: 00 55 aa  unk_8b91        .BYTE $00,$55,$aa    ; 4 bytes: Multiples of $55 (85)
8b94: ff                        .BYTE $ff            ;     TODO: Where is this used?
                                                     ;   0: $00 (0)
                                                     ;   1: $55 (85)
                                                     ;   2: $aa (170)
                                                     ;   3: $ff (255)

8b95: 00 10 54  dat_8b95        .BYTE $00,$10,$54    ; ..T

8b98: 00 05 06  dat_8b98        .BYTE $00,$05,$06    ; ...

8b9b: a7 37 7f  dat_8b9b        .BYTE $a7,$37,$7f    ; .7.

8b9e: 8b 8c 8c  dat_8b9e        .BYTE $8b,$8c,$8c    ; ...

8ba1: ef 5b 91  dat_8ba1        .BYTE $ef,$5b,$91    ; .[.

8ba4: 8b 8c 8c  dat_8ba4        .BYTE $8b,$8c,$8c    ; ...

8ba7: 00 12 24  unk_8ba7        .BYTE $00,$12,$24                      ; ..$
8baa: 36 48 5a 6c 7e 90 a2 b4   .BYTE $36,$48,$5a,$6c,$7e,$90,$a2,$b4  ; 6HZl~...
8bb2: c6 d8 ea fc 0e 20 32 44   .BYTE $c6,$d8,$ea,$fc,$0e,$20,$32,$44  ; ..... 2D
8bba: 56 68 7a 8c 9e b0 c2 d4   .BYTE $56,$68,$7a,$8c,$9e,$b0,$c2,$d4  ; Vhz.....
8bc2: e6 f8 0a 1c 2e 40 52 64   .BYTE $e6,$f8,$0a,$1c,$2e,$40,$52,$64  ; .....@Rd
8bca: 76 88 9a ac be d0 e2 f4   .BYTE $76,$88,$9a,$ac,$be,$d0,$e2,$f4  ; v.......
8bd2: 06 18 2a 3c 4e 60 72 84   .BYTE $06,$18,$2a,$3c,$4e,$60,$72,$84  ; ..*<N`r.
8bda: 96 a8 ba cc de f0 02 14   .BYTE $96,$a8,$ba,$cc,$de,$f0,$02,$14  ; ........
8be2: 26 38 4a 5c 6e 80 92 a4   .BYTE $26,$38,$4a,$5c,$6e,$80,$92,$a4  ; &8J\n...
8bea: b6 c8 da ec fe 00 00 00   .BYTE $b6,$c8,$da,$ec,$fe,$00,$00,$00  ; ........
8bf2: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ; ........
8bfa: 00 00 00 00 01 01 01 01   .BYTE $00,$00,$00,$00,$01,$01,$01,$01  ; ........
8c02: 01 01 01 01 01 01 01 01   .BYTE $01,$01,$01,$01,$01,$01,$01,$01  ; ........
8c0a: 01 01 02 02 02 02 02 02   .BYTE $01,$01,$02,$02,$02,$02,$02,$02  ; ........
8c12: 02 02 02 02 02 02 02 02   .BYTE $02,$02,$02,$02,$02,$02,$02,$02  ; ........
8c1a: 03 03 03 03 03 03 03 03   .BYTE $03,$03,$03,$03,$03,$03,$03,$03  ; ........
8c22: 03 03 03 03 03 03 04 04   .BYTE $03,$03,$03,$03,$03,$03,$04,$04  ; ........
8c2a: 04 04 04 04 04 04 04 04   .BYTE $04,$04,$04,$04,$04,$04,$04,$04  ; ........
8c32: 04 04 04 04 04 00 09 12   .BYTE $04,$04,$04,$04,$04,$00,$09,$12  ; ........
8c3a: 1b 24 2d 36 3f 48 51 5a   .BYTE $1b,$24,$2d,$36,$3f,$48,$51,$5a  ; .$-6?HQZ
8c42: 63 6c 75 7e 87 90 99 a2   .BYTE $63,$6c,$75,$7e,$87,$90,$99,$a2  ; clu~....
8c4a: ab b4 bd c6 cf d8 e1 ea   .BYTE $ab,$b4,$bd,$c6,$cf,$d8,$e1,$ea  ; ........
8c52: f3 fc 05 0e 17 20 29 32   .BYTE $f3,$fc,$05,$0e,$17,$20,$29,$32  ; ..... )2
8c5a: 3b 00 00 00 00 00 00 00   .BYTE $3b,$00,$00,$00,$00,$00,$00,$00  ; ;.......
8c62: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ; ........
8c6a: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ; ........
8c72: 00 00 00 00 00 00 01 01   .BYTE $00,$00,$00,$00,$00,$00,$01,$01  ; ........
8c7a: 01 01 01 01 01 00 05 0a   .BYTE $01,$01,$01,$01,$01,$00,$05,$0a  ; ........
8c82: 0f 14 19 1e 23 28 2d 32   .BYTE $0f,$14,$19,$1e,$23,$28,$2d,$32  ; ....#(-2
8c8a: 37 3c 41 46 4b 50 55 00   .BYTE $37,$3c,$41,$46,$4b,$50,$55,$00  ; 7<AFKPU.
8c92: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ; ........
8c9a: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ; ........
8ca2: 00                        .BYTE $00                              ; .

8ca3: 5f 33 07  dat_8ca3_L      .BYTE $5f,$33,$07                  ; LSB of address where map cell data is copied
8ca6: db af 83 57 2b ff d3      .BYTE $db,$af,$83,$57,$2b,$ff,$d3  ;

8cad: 96 96 96  dat_8ca3_H      .BYTE $96,$96,$96                  ; MSB of address where map cell data is copied
8cb0: 95 95 95 95 95 94 94      .BYTE $95,$95,$95,$95,$95,$94,$94  ;     0: $965f [MapCellData0]
                                                                   ;     1: $9633 [MapCellData1]
                                                                   ;     2: $9607 [MapCellData2]
                                                                   ;     3: $95db [MapCellData3]
                                                                   ;     4: $95af [MapCellData4]
                                                                   ;     5: $9583 [MapCellData5]
                                                                   ;     6: $9557 [MapCellData6]
                                                                   ;     7: $952b [MapCellData7]
                                                                   ;     8: $94ff [MapCellData8]
                                                                   ;     9: $94d3 [MapCellData9]

8cb7: 01 02 03  dat_8cb7        .BYTE $01,$02,$03                  ; 10 bytes: Number of inner loop iterations
8cba: 04 05 05 05 05 05 05      .BYTE $04,$05,$05,$05,$05,$05,$05  ;     0: 1        5: 5
                                                                   ;     1: 2        6: 5
                                                                   ;     2: 3        7: 5
                                                                   ;     3: 4        8: 5
                                                                   ;     4: 5        9: 5

8cc1: 00 00 00  dat_8cc1        .BYTE $00,$00,$00                      ; ...
8cc4: 00 00 01 00 00 00 00 00   .BYTE $00,$00,$01,$00,$00,$00,$00,$00  ; ........

8ccc: 0f 1c 24  dat_8ccc        .BYTE $0f,$1c,$24                      ; ..$
8ccf: 33 55 00 55 33 24 1c 0f   .BYTE $33,$55,$00,$55,$33,$24,$1c,$0f  ; 3U.U3$..

8cd7: ed f8 03  dat_8cd7        .BYTE $ed,$f8,$03                      ; ...
8cda: 0e 19 24 19 0e 03 f8 ed   .BYTE $0e,$19,$24,$19,$0e,$03,$f8,$ed  ; ..$.....

8ce2: 8c 8c 8d  dat_8ce2        .BYTE $8c,$8c,$8d                      ; ...
8ce5: 8d 8d 8d 8d 8d 8d 8c 8c   .BYTE $8d,$8d,$8d,$8d,$8d,$8d,$8c,$8c  ; ........
8ced: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ; ........
8cf5: 0b 0b 00 00 00 00 00 00   .BYTE $0b,$0b,$00,$00,$00,$00,$00,$00  ; ........
8cfd: 00 09 09 09 09 00 00 00   .BYTE $00,$09,$09,$09,$09,$00,$00,$00  ; ........
8d05: 00 00 00 00 07 07 07 07   .BYTE $00,$00,$00,$00,$07,$07,$07,$07  ; ........
8d0d: 00 00 00 00 00 0a 05 05   .BYTE $00,$00,$00,$00,$00,$0a,$05,$05  ; ........
8d15: 05 05 05 00 00 24 12 09   .BYTE $05,$05,$05,$00,$00,$24,$12,$09  ; .....$..
8d1d: 06 03 03 03 03 03 00      .BYTE $06,$03,$03,$03,$03,$03,$00      ; .......

8d24: 24 12 06  dat_8d24        .BYTE $24,$12,$06                      ; 11 bytes: Lookup table of 72 / 2^(idx + 1)
8d27: 03 02 01 01 01 01 01 00   .BYTE $03,$02,$01,$01,$01,$01,$01,$00  ;    0: $24 (36)         6: $01 (0.5)
                                                                       ;    1: $12 (18)         7: $01 (0.25)
                                                                       ;    2: $06              8: $01 (0.125)
                                                                       ;    3: $03              9: $01 (0.0625)
                                                                       ;    4: $02 (1.5)       10: $00
                                                                       ;    5: $01

8d2f: 3b 46 51  dat_8d2f        .BYTE $3b,$46,$51    ; ;FQ
8d32: 5c 67 72                  .BYTE $5c,$67,$72    ; \gr

8d35: 8d 8d 8d  dat_8d35        .BYTE $8d,$8d,$8d                      ; ...
8d38: 8d 8d 8d ff ff ff ff ff   .BYTE $8d,$8d,$8d,$ff,$ff,$ff,$ff,$ff  ; ........
8d40: ff ff ff 03 0e 19 ff ff   .BYTE $ff,$ff,$ff,$03,$0e,$19,$ff,$ff  ; ........
8d48: ff ff ff ee f7 00 09 12   .BYTE $ff,$ff,$ff,$ee,$f7,$00,$09,$12  ; ........
8d50: 1b ff ff ff e5 f3 fa 01   .BYTE $1b,$ff,$ff,$ff,$e5,$f3,$fa,$01  ; ........
8d58: 08 0f 16 1d ff ff ff f7   .BYTE $08,$0f,$16,$1d,$ff,$ff,$ff,$f7  ; ........
8d60: 01 06 0b 10 15 1a 1f ca   .BYTE $01,$06,$0b,$10,$15,$1a,$1f,$ca  ; ........
8d68: ee 00 09 0f 12 15 18 1b   .BYTE $ee,$00,$09,$0f,$12,$15,$18,$1b  ; ........
8d70: 1e 21                     .BYTE $1e,$21                          ; .!

8d72: 00        dat_8d72        .BYTE $00            ; .

8d73: 12 18 1b  dat_8d73        .BYTE $12,$18,$1b    ; ...
8d76: 1d 1e                     .BYTE $1d,$1e        ; ..

8d78: 1f 20 21  dat_8d78        .BYTE $1f,$20,$21    ; . !
8d7b: 22 23 89                  .BYTE $22,$23,$89    ; "#.

8d7e: 94 9f aa  dat_8d7e        .BYTE $94,$9f,$aa    ; ...
8d81: b5 c0 8d 8d 8d 8d 8d 8d   .BYTE $b5,$c0,$8d,$8d,$8d,$8d,$8d,$8d  ; ........
8d89: 48 36 30 2d 2b 2a 29 28   .BYTE $48,$36,$30,$2d,$2b,$2a,$29,$28  ; H60-+*)(
8d91: 27 26 25 7e 5a 48 3f 39   .BYTE $27,$26,$25,$7e,$5a,$48,$3f,$39  ; '&%~ZH?9
8d99: 36 33 30 2d 2a 27 49 49   .BYTE $36,$33,$30,$2d,$2a,$27,$49,$49  ; 630-*'II
8da1: 49 51 47 42 3d 38 33 2e   .BYTE $49,$51,$47,$42,$3d,$38,$33,$2e  ; IQGB=83.
8da9: 29 49 49 49 49 49 4e 47   .BYTE $29,$49,$49,$49,$49,$49,$4e,$47  ; )IIIIING
8db1: 40 39 32 2b 49 49 49 49   .BYTE $40,$39,$32,$2b,$49,$49,$49,$49  ; @92+IIII
8db9: 49 49 51 48 3f 36 2d 49   .BYTE $49,$49,$51,$48,$3f,$36,$2d,$49  ; IIQH?6-I
8dc1: 49 49 49 49 49 49 50 45   .BYTE $49,$49,$49,$49,$49,$49,$50,$45  ; IIIIIIPE
8dc9: 3a 2f                     .BYTE $3a,$2f        ; :/

8dcb: 0f        dat_8dcb        .BYTE $0f            ; .

8dcc: f0 0f f0  dat_8dcc        .BYTE $f0,$0f,$f0    ; 4 bytes: Bit masks for selecting wall bits based on player
8dcf: 0f                        .BYTE $0f            ;          orientation.
                                                     ;   0 [North]: $f0 - selects high nibble
                                                     ;   1 [East]:  $0f - selects low nibble
                                                     ;   2 [South]: $f0 - selects high nibble
                                                     ;   3 [West]:  $0f - selects low nibble

8dd0: 01        dat_8dd0        .BYTE $01            ; 4 bytes (overlaps dat_8dd1, dat_8dd2):
                                                     ;   0 [North]: $01 -
                                                     ; * 1 [East]:  $00 -
                                                     ; * 2 [South]: $00 -
                                                     ; * 3 [West]:  $01 -

8dd1: 00        dat_8dd1        .BYTE $00            ; 4 bytes (overlaps dat_8dd2):
                                                     ;   0 [North]: $00 -
                                                     ; * 1 [East]:  $00 -
                                                     ; * 2 [South]: $01 -
                                                     ; * 3 [West]:  $01 -

8dd2: 00 01 01  dat_8dd2        .BYTE $00,$01,$01    ; 4 bytes:
8dd5: 00                        .BYTE $00            ;   0 [North]: $00 -
                                                     ;   1 [East]:  $01 -
                                                     ;   2 [South]: $01 -
                                                     ;   3 [West]:  $00 -

8dd6: ff 00 ff  unk_8dd6        .BYTE $ff,$00,$ff                      ; ...
8dd9: 00 ff 00 ff 00 ff 00 ff   .BYTE $00,$ff,$00,$ff,$00,$ff,$00,$ff  ; ........
8de1: 00 ff 00 ff 00 ff 00 ff   .BYTE $00,$ff,$00,$ff,$00,$ff,$00,$ff  ; ........
8de9: 00 ff 00 ff 00 ff 00 ff   .BYTE $00,$ff,$00,$ff,$00,$ff,$00,$ff  ; ........
8df1: 00 ff 00 ff 00 ff 00 ff   .BYTE $00,$ff,$00,$ff,$00,$ff,$00,$ff  ; ........
8df9: 00 ff 00 ff 00 ff 00      .BYTE $00,$ff,$00,$ff,$00,$ff,$00      ; .......

8e00: 00 55 aa  dat_8e00        .BYTE $00,$55,$aa                      ; .U.
8e03: ff 55 00 ff 00 aa 00 ff   .BYTE $ff,$55,$00,$ff,$00,$aa,$00,$ff  ; .U......
8e0b: 00 ff 00 ff 00 55 00 ff   .BYTE $00,$ff,$00,$ff,$00,$55,$00,$ff  ; .....U..
8e13: 00 ff 00 ff 00 ff 00 ff   .BYTE $00,$ff,$00,$ff,$00,$ff,$00,$ff  ; ........
8e1b: 00 ff 00 ff 00 aa 00 ff   .BYTE $00,$ff,$00,$ff,$00,$aa,$00,$ff  ; ........
8e23: 00 ff 00 ff 00 ff 00 ff   .BYTE $00,$ff,$00,$ff,$00,$ff,$00,$ff  ; ........
8e2b: 00 ff 00 ff 00 ff 00 ff   .BYTE $00,$ff,$00,$ff,$00,$ff,$00,$ff  ; ........
8e33: 00 ff 00 ff 00 ff 00 ff   .BYTE $00,$ff,$00,$ff,$00,$ff,$00,$ff  ; ........
8e3b: 00 ff 00 ff 00 55         .BYTE $00,$ff,$00,$ff,$00,$55          ; .....U

8e41: 09 04 03  dat_8e41        .BYTE $09,$04,$03                      ; ...
8e44: 02 01 01 01 01 01 01 01   .BYTE $02,$01,$01,$01,$01,$01,$01,$01  ; ........
8e4c: 01 01 01 01 01 01 01 01   .BYTE $01,$01,$01,$01,$01,$01,$01,$01  ; ........
8e54: 01 01 01 01 01 01 01 01   .BYTE $01,$01,$01,$01,$01,$01,$01,$01  ; ........
8e5c: 01 01 01 01 01 01 01 01   .BYTE $01,$01,$01,$01,$01,$01,$01,$01  ; ........
8e64: 01 00 ff 00 ff 00 ff 00   .BYTE $01,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
8e6c: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
8e74: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
8e7c: ff 00 ff 00 aa            .BYTE $ff,$00,$ff,$00,$aa              ; .....

8e81: 00 80 00  dat_8e81        .BYTE $00,$80,$00                      ; ...
8e84: 40 cd 80 49 20 00 cd a3   .BYTE $40,$cd,$80,$49,$20,$00,$cd,$a3  ; @..I ...
8e8c: 80 62 49 33 20 0f 00 e5   .BYTE $80,$62,$49,$33,$20,$0f,$00,$e5  ; .bI3 ...
8e94: cd b7 a3 91 80 71 62 55   .BYTE $cd,$b7,$a3,$91,$80,$71,$62,$55  ; .....qbU
8e9c: 49 3e 33 29 20 17 0f 07   .BYTE $49,$3e,$33,$29,$20,$17,$0f,$07  ; I>3) ...
8ea4: 00 00 ff 00 ff 00 ff 00   .BYTE $00,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
8eac: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
8eb4: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
8ebc: ff 00 ff 00 ff            .BYTE $ff,$00,$ff,$00,$ff              ; .....

8ec1: 02 02 02  dat_8ec1        .BYTE $02,$02,$02                      ; ...
8ec4: 02 02 02 02 02 02 01 01   .BYTE $02,$02,$02,$02,$02,$02,$01,$01  ; ........
8ecc: 01 01 01 01 01 01 01 00   .BYTE $01,$01,$01,$01,$01,$01,$01,$00  ; ........
8ed4: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ; ........
8edc: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ; ........
8ee4: 00                        .BYTE $00                              ; .

8ee5: 48 24 18  dat_8ee5        .BYTE $48,$24,$18                      ; H$.
8ee8: 12 0e 0c 0a 09 08 07 06   .BYTE $12,$0e,$0c,$0a,$09,$08,$07,$06  ; ........
8ef0: 06 05 05 04 04 04 04 03   .BYTE $06,$05,$05,$04,$04,$04,$04,$03  ; ........
8ef8: 03 03 03 03 03 02 02 02   .BYTE $03,$03,$03,$03,$03,$02,$02,$02  ; ........
8f00: 02 02 02 02 02 02 02 02   .BYTE $02,$02,$02,$02,$02,$02,$02,$02  ; ........
8f08: 02 01 01 01 01 01 01 01   .BYTE $02,$01,$01,$01,$01,$01,$01,$01  ; ........
8f10: 01 01 01 01 01 01 01 01   .BYTE $01,$01,$01,$01,$01,$01,$01,$01  ; ........
8f18: 01 01 01 01 01 01 01 01   .BYTE $01,$01,$01,$01,$01,$01,$01,$01  ; ........
8f20: 01 01 01 01 01 01 01 01   .BYTE $01,$01,$01,$01,$01,$01,$01,$01  ; ........
8f28: 01 01 01 01 01            .BYTE $01,$01,$01,$01,$01              ; .....

8f2d: 00 00 00  dat_8f2d        .BYTE $00,$00,$00                      ; ...
8f30: 00 66 00 49 00 00 33 8c   .BYTE $00,$66,$00,$49,$00,$00,$33,$8c  ; .f.I..3.
8f38: 00 8a 25 cd 80 3c 00 ca   .BYTE $00,$8a,$25,$cd,$80,$3c,$00,$ca  ; ..%..<..
8f40: 9a 6e 46 21 00 e1 c5 ab   .BYTE $9a,$6e,$46,$21,$00,$e1,$c5,$ab  ; .nF!....
8f48: 92 7c 66 53 40 2f 1e 0f   .BYTE $92,$7c,$66,$53,$40,$2f,$1e,$0f  ; .|fS@/..
8f50: 00 f2 e5 d9 cd c2 b7 ad   .BYTE $00,$f2,$e5,$d9,$cd,$c2,$b7,$ad  ; ........
8f58: a3 9a 91 88 80 78 71 69   .BYTE $a3,$9a,$91,$88,$80,$78,$71,$69  ; .....xqi
8f60: 62 5c 55 4f 49 43 3e 38   .BYTE $62,$5c,$55,$4f,$49,$43,$3e,$38  ; b\UOIC>8
8f68: 33 2e 29 25 20 1c 17 13   .BYTE $33,$2e,$29,$25,$20,$1c,$17,$13  ; 3.)% ...
8f70: 0f 0b 07 04 00            .BYTE $0f,$0b,$07,$04,$00              ; .....

8f75: 00        dat_8f75        .BYTE $00            ; .

8f76: 00        dat_8f76        .BYTE $00            ; .

8f77: 00        dat_8f77        .BYTE $00            ; .

8f78: 00 00     unk_8f78        .BYTE $00,$00        ; ..

8f7a: 00        dat_8f7a        .BYTE $00            ; .

                ; Start of FrameBuf0
8f7b: 00 ff 00  src_8f7b        .BYTE $00,$ff,$00                      ; ...
8f7e: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
8f86: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

8f8d: 00 ff 00  src_8f8d        .BYTE $00,$ff,$00                      ; ...
8f90: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
8f98: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

8f9f: 00 ff 00  src_8f9f        .BYTE $00,$ff,$00                      ; ...
8fa2: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
8faa: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

8fb1: 00 ff 00  src_8fb1        .BYTE $00,$ff,$00                      ; ...
8fb4: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
8fbc: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

8fc3: 00 ff 00  src_8fc3        .BYTE $00,$ff,$00                      ; ...
8fc6: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
8fce: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

8fd5: 00 ff 00  src_8fd5        .BYTE $00,$ff,$00                      ; ...
8fd8: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
8fe0: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

8fe7: 00 ff 00  src_8fe7        .BYTE $00,$ff,$00                      ; ...
8fea: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
8ff2: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

8ff9: 00 ff 00  src_8ff9        .BYTE $00,$ff,$00                      ; ...
8ffc: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9004: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

900b: 00 ff 00  src_900b        .BYTE $00,$ff,$00                      ; ...
900e: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9016: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

901d: 00 ff 00  src_901d        .BYTE $00,$ff,$00                      ; ...
9020: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9028: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

902f: 00 ff 00  src_902f        .BYTE $00,$ff,$00                      ; ...
9032: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
903a: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

9041: 00 ff 00  src_9041        .BYTE $00,$ff,$00                      ; ...
9044: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
904c: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

                ; Start of FrameBuf1
9053: 00 ff 00  src_9053        .BYTE $00,$ff,$00                      ; ...
9056: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
905e: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

9065: 00 ff 00  src_9065        .BYTE $00,$ff,$00                      ; ...
9068: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9070: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

9077: 00 ff 00  src_9077        .BYTE $00,$ff,$00                      ; ...
907a: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9082: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

9089: 00 ff 00  src_9089        .BYTE $00,$ff,$00                      ; ...
908c: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9094: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

909b: 00 ff 00  src_909b        .BYTE $00,$ff,$00                      ; ...
909e: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
90a6: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

90ad: 00 ff 00  src_90ad        .BYTE $00,$ff,$00                      ; ...
90b0: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
90b8: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

90bf: 00 ff 00  src_90bf        .BYTE $00,$ff,$00                      ; ...
90c2: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
90ca: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

90d1: 00 ff 00  src_90d1        .BYTE $00,$ff,$00                      ; ...
90d4: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
90dc: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

90e3: 00 ff 00  src_90e3        .BYTE $00,$ff,$00                      ; ...
90e6: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
90ee: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

90f5: 00 ff 00  src_90f5        .BYTE $00,$ff,$00                      ; ...
90f8: ff 00 ff 00 ff 00 ff 6f   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$6f  ; .......o       $6f @ 90ff  ... hmm
9100: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

9107: 00 ff 00  src_9107        .BYTE $00,$ff,$00                      ; ...
910a: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9112: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

9119: 00 ff 00  src_9119        .BYTE $00,$ff,$00                      ; ...
911c: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9124: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

                ; Start of FrameBuf2
912b: 00 ff 00  src_912b        .BYTE $00,$ff,$00                      ; ...
912e: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9136: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

913d: 00 ff 6f  src_913d        .BYTE $00,$ff,$6f                      ; ..o            $6f @ 913f  ... odd
9140: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9148: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

914f: 00 ff 00  src_914f        .BYTE $00,$ff,$00                      ; ...
9152: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
915a: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

9161: 00 ff 00  src_9161        .BYTE $00,$ff,$00                      ; ...
9164: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
916c: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

9173: 00 ff 00  src_9173        .BYTE $00,$ff,$00                      ; ...
9176: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
917e: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

9185: 00 ff 00  src_9185        .BYTE $00,$ff,$00                      ; ...
9188: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9190: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

9197: 00 ff 00  src_9197        .BYTE $00,$ff,$00                      ; ...
919a: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
91a2: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

91a9: 00 ff 00  src_91a9        .BYTE $00,$ff,$00                      ; ...
91ac: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
91b4: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

91bb: 00 ff 00  src_91bb        .BYTE $00,$ff,$00                      ; ...
91be: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
91c6: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

91cd: 00 ff 00  src_91cd        .BYTE $00,$ff,$00                      ; ...
91d0: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
91d8: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

91df: 00 ff 00  src_91df        .BYTE $00,$ff,$00                      ; ...
91e2: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
91ea: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

91f1: 00 ff 00  src_91f1        .BYTE $00,$ff,$00                      ; ...
91f4: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
91fc: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

                ; Start of FrameBuf3
9203: 00 ff 00  src_9203        .BYTE $00,$ff,$00                      ; ...
9206: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
920e: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

9215: 00 ff 00  src_9215        .BYTE $00,$ff,$00                      ; ...
9218: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9220: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

9227: 00 ff 00  src_9227        .BYTE $00,$ff,$00                      ; ...
922a: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9232: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

9239: 00 ff 00  src_9239        .BYTE $00,$ff,$00                      ; ...
923c: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9244: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

924b: 00 ff 00  src_924b        .BYTE $00,$ff,$00                      ; ...
924e: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9256: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

925d: 00 ff 00  src_925d        .BYTE $00,$ff,$00                      ; ...
9260: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9268: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

926f: 00 ff 00  src_926f        .BYTE $00,$ff,$00                      ; ...
9272: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
927a: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

9281: 00 ff 00  src_9281        .BYTE $00,$ff,$00                      ; ...
9284: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
928c: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

9293: 00 ff 00  src_9293        .BYTE $00,$ff,$00                      ; ...
9296: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
929e: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

92a5: 00 ff 00  src_92a5        .BYTE $00,$ff,$00                      ; ...
92a8: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
92b0: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

92b7: 00 ff 00  src_92b7        .BYTE $00,$ff,$00                      ; ...
92ba: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
92c2: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

92c9: 00 ff 00  src_92c9        .BYTE $00,$ff,$00                      ; ...
92cc: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
92d4: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

                ; Start of FrameBuf4
92db: 00 ff 00  src_92db        .BYTE $00,$ff,$00                      ; ...
92de: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
92e6: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

92ed: 00 ff 00  src_92ed        .BYTE $00,$ff,$00                      ; ...
92f0: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
92f8: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

92ff: 6f ff 00  src_92ff        .BYTE $6f,$ff,$00                      ; o..            $6f @ 92ff  ... interesting
9302: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
930a: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

9311: 00 ff 00  src_9311        .BYTE $00,$ff,$00                      ; ...
9314: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
931c: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

9323: 00 ff 00  src_9323        .BYTE $00,$ff,$00                      ; ...
9326: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
932e: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

9335: 00 ff 00  src_9335        .BYTE $00,$ff,$00                      ; ...
9338: ff 00 ff 00 ff 00 ff 6f   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$6f  ; .......o       $6f @ 933f  ... a pattern?
9340: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

9347: 00 ff 00  src_9347        .BYTE $00,$ff,$00                      ; ...
934a: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9352: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

9359: 00 ff 00  src_9359        .BYTE $00,$ff,$00                      ; ...
935c: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9364: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

936b: 00 ff 00  src_936b        .BYTE $00,$ff,$00                      ; ...
936e: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9376: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

937d: 00 ff 00  src_937d        .BYTE $00,$ff,$00                      ; ...
9380: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9388: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

938f: 00 ff 00  src_938f        .BYTE $00,$ff,$00                      ; ...
9392: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
939a: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

93a1: 00 ff 00  src_93a1        .BYTE $00,$ff,$00                      ; ...
93a4: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
93ac: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

                ; Start of FrameBuf5
93b3: 00 ff 00  src_93b3        .BYTE $00,$ff,$00                      ; ...
93b6: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
93be: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

93c5: 00 ff 00  src_93c5        .BYTE $00,$ff,$00                      ; ...
93c8: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
93d0: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

93d7: 00 ff 00  src_93d7        .BYTE $00,$ff,$00                      ; ...
93da: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
93e2: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

93e9: 00 ff 00  src_93e9        .BYTE $00,$ff,$00                      ; ...
93ec: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
93f4: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

93fb: 00 ff 00  src_93fb        .BYTE $00,$ff,$00                      ; ...
93fe: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9406: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

940d: 00 ff 00  src_940d        .BYTE $00,$ff,$00                      ; ...
9410: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9418: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

941f: 00 ff 00  src_941f        .BYTE $00,$ff,$00                      ; ...
9422: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
942a: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

9431: 00 ff 00  src_9431        .BYTE $00,$ff,$00                      ; ...
9434: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
943c: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

9443: 00 ff 00  src_9443        .BYTE $00,$ff,$00                      ; ...
9446: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
944e: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

9455: 00 ff 00  src_9455        .BYTE $00,$ff,$00                      ; ...
9458: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9460: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

9467: 00 ff 00  src_9467        .BYTE $00,$ff,$00                      ; ...
946a: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9472: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; ........

9479: 00 ff 00  src_9479        .BYTE $00,$ff,$00                      ; ...
947c: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9474: ff 00 ff 00 ff 00 ff      .BYTE $ff,$00,$ff,$00,$ff,$00,$ff      ; .......

948b: 00 ff 00  dat_948b        .BYTE $00,$ff,$00                      ; ...
948e: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9496: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
949e: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
94a6: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
94ae: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
94b6: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
94be: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
94c6: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
94ce: ff 00 ff 00 ff            .BYTE $ff,$00,$ff,$00,$ff              ; .....

94d3: 00 ff 00  MapCellData9    .BYTE $00,$ff,$00    ; 4 bytes: Map cell data is copied here (dat_8ca3_L/H[9])
94d6: ff                        .BYTE $ff            ;

94d7: 00 ff 00  unk_94d7        .BYTE $00,$ff,$00                      ; ...
94da: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
94e2: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
94ea: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
94f2: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
94fa: ff 00 ff 00 ff            .BYTE $ff,$00,$ff,$00,$ff              ; .....

                                                                                        ; $6f @ 94ff  ... well...
94ff: 6f ff 00  MapCellData8    .BYTE $6f,$ff,$00    ; 4 bytes: Map cell data is copied here (dat_8ca3_L/H[8])
9502: ff                        .BYTE $ff            ;

9503: 00 ff 00  unk_9503        .BYTE $00,$ff,$00                      ; ...
9506: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
950e: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9516: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
951e: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9526: ff 00 ff 00 ff            .BYTE $ff,$00,$ff,$00,$ff              ; .....

952b: 00 ff 00  MapCellData7    .BYTE $00,$ff,$00    ; 4 bytes: Map cell data is copied here (dat_8ca3_L/H[7])
952e: ff                        .BYTE $ff            ;

952f: 00 ff 00  unk_952f        .BYTE $00,$ff,$00                      ; ...
9532: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
953a: ff 00 ff 00 ff 6f ff 00   .BYTE $ff,$00,$ff,$00,$ff,$6f,$ff,$00  ; .....o..       ; $6f @ 953f  ... what is it?
9542: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
954a: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9552: ff 00 ff 00 ff            .BYTE $ff,$00,$ff,$00,$ff              ; .....

9557: 00 ff 00  MapCellData6    .BYTE $00,$ff,$00    ; 4 bytes: Map cell data is copied here (dat_8ca3_L/H[6])
955a: ff                        .BYTE $ff            ;

955b: 00 ff 00  unk_955B        .BYTE $00,$ff,$00                      ; ...
955e: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9566: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
956e: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9576: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
957e: ff 00 ff 00 ff            .BYTE $ff,$00,$ff,$00,$ff              ; .....

9583: 00 ff 00  MapCellData5    .BYTE $00,$ff,$00    ; 4 bytes: Map cell data is copied here (dat_8ca3_L/H[5])
9586: ff                        .BYTE $ff            ;

9587: 00 ff 00  unk_9587        .BYTE $00,$ff,$00                      ; ...
958a: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9592: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
959a: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
95a2: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
95aa: ff 00 ff 00 ff            .BYTE $ff,$00,$ff,$00,$ff              ; .....

95af: 00 ff 00  MapCellData4    .BYTE $00,$ff,$00    ; 4 bytes: Map cell data is copied here (dat_8ca3_L/H[4])
95b2: ff                        .BYTE $ff            ;

95b3: 00 ff 00  unk_95b3        .BYTE $00,$ff,$00                      ;
95b6: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ;
95be: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ;
95c6: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ;
95ce: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ;
95d6: ff 00 ff 00 ff            .BYTE $ff,$00,$ff,$00,$ff              ;

95db: 00 ff 00  MapCellData3    .BYTE $00,$ff,$00    ; 4 bytes: Map cell data is copied here (dat_8ca3_L/H[3])
95de: ff                        .BYTE $ff            ;

95df: 00 ff 00  unk_95df        .BYTE $00,$ff,$00                      ;
95e2: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ;
95ea: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ;
95f2: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ;
95fa: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ;
9602: ff 00 ff 00 ff            .BYTE $ff,$00,$ff,$00,$ff              ;

9607: 00 ff 00  MapCellData2    .BYTE $00,$ff,$00    ; 4 bytes: Map cell data is copied here (dat_8ca3_L/H[2])
960a: ff                        .BYTE $ff            ;

960b: 00 ff 00  unk_960b        .BYTE $00,$ff,$00                      ;
960e: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ;
9616: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ;
961e: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ;
9626: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ;
962e: ff 00 ff 00 ff            .BYTE $ff,$00,$ff,$00,$ff              ;

9633: 00 ff 00  MapCellData1    .BYTE $00,$ff,$00    ; 4 bytes: Map cell data is copied here (dat_8ca3_L/H[1])
9636: ff                        .BYTE $ff            ;

9637: 00 ff 00  unk_9637        .BYTE $00,$ff,$00                      ; ...
963a: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9642: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
964a: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9652: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
965a: ff 00 ff 00 ff            .BYTE $ff,$00,$ff,$00,$ff              ; .....

965f: 00 ff 00  MapCellData0    .BYTE $00,$ff,$00    ; 4 bytes: Map cell data is copied here (dat_8ca3_L/H[0])
9662: ff                        .BYTE $ff            ;

9663: 00 ff 00  unk_9663        .BYTE $00,$ff,$00                      ; ...
9666: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
966e: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9676: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
967e: ff 00 ff 00 ff 00 ff 00   .BYTE $ff,$00,$ff,$00,$ff,$00,$ff,$00  ; ........
9686: ff 00 ff 00 ff            .BYTE $ff,$00,$ff,$00,$ff              ; .....

968b: 00 00 00  unk_968b        .BYTE $00,$00,$00                      ; ...
968e: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ; ........
9696: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ; ........
969e: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ; ........
96a6: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ; ........
96ae: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ; ........
96b6: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ; ........
96be: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ; ........
96c6: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ; ........
96ce: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ; ........
96d6: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ; ........
96de: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ; ........
96e6: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ; ........
96ee: 00 00                     .BYTE $00,$00                          ; ..
