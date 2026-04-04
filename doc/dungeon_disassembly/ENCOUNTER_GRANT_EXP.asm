; Subroutine called after defeating a foe in an encounter
; Calculates player experience gain
; and apparently a bunch more
9124: A5 A7    ENCOUNTER_GRANT_EXP
                        LDA $A7                 ; Store value from $A7 (hi) into
9126: 85 D4             STA FR0                 ;   FR0 (floating-point register 0 - no FP subs called; used as temp)
9128: A5 A8             LDA $A8                 ; Store value from $A8 (lo) into
912A: 85 D5             STA $D5                 ;   FR0+1 (floating-point register 1 - no FP subs called; used as temp)
912C: A5 A8             LDA $A8                 ; Read value at $A7 into A
912E: CD 23 AA          CMP $AA23               ;
9131: A5 A7             LDA $A7                 ;
9133: ED 22 AA          SBC $AA22               ;
9136: 90 0A             BCC $9142               ;
9138: AD 22 AA          LDA $AA22               ;
913B: 85 D4             STA FR0                 ;
913D: AD 23 AA          LDA $AA23               ;
9140: 85 D5             STA $D5                 ;
9142: 46 D4             LSR FR0                 ; Shift the 16-bit value in $d4 (hi)
9144: 66 D5             ROR $D5                 ;    $d5 (lo) right one bit
9146: 18                CLC                     ; Add the lo byte of the 16 bit value
9147: A5 D5             LDA $D5                 ;   stored in FR0/FR1 (experience gained)
9149: 6D 40 63          ADC CHR_EXP_U32_B0      ;   to the player
914C: 8D 40 63          STA CHR_EXP_U32_B0      ;   experience points byte 0
914F: A5 D4             LDA FR0                 ; Add the hi byte of the experience
9151: 6D 3F 63          ADC CHR_EXP_U32_B1      ;   gained to the player
9154: 8D 3F 63          STA CHR_EXP_U32_B1      ;   experience points byte 1.
9157: 90 08             BCC L9161               ; Skip updating high word if no carry
9159: EE 3E 63          INC CHR_EXP_U32_B2      ; Apply carry to the player experience points byte 2
915C: D0 03             BNE L9161               ; Skip updating byte 3 if no overflow
915E: EE 3D 63          INC CHR_EXP_U32_B3      ; Apply carry to the player experience points byte 3
                      ; Check for level up
9161: A2 00    L9161    LDX #$00                ; Set X to 0
9163: BD 3D 63 L9163    LDA CHR_EXP_U32_B3,X    ; Read player experience points
9166: DD 41 63          CMP $6341,X             ;   and compare to experience needed to level up
9169: F0 03             BEQ L916E               ; IF equal, skip to check next byte
916B: B0 08             BCS L9175               ; If the value is not equal,
916D: 60       L916D    RTS                     ;    return to caller
916E: E8       L916E    INX
916F: E0 04             CPX #$04
9171: 90 F0             BCC L9163
9173: B0 F8             BCS L916D
9175: 18       L9175    CLC
9176: A2 03             LDX #$03
9178: 3E 41 63 L9178    ROL $6341,X
917B: CA                DEX
917C: 10 FA             BPL L9178
917E: 38                SEC
917F: AD 44 63          LDA $6344
9182: ED 69 63          SBC $6369
9185: 8D 44 63          STA $6344
9188: A2 02             LDX #$02
918A: BD 41 63 L918A    LDA $6341,X
918D: E9 00             SBC #$00
918F: 9D 41 63          STA $6341,X
9192: CA                DEX
9193: 10 F5             BPL L918A
9195: A0 03             LDY #$03
9197: AD 4A 63          LDA $634A
919A: 4A                LSR
919B: 4A                LSR
919C: 4A                LSR
919D: 4A                LSR
919E: C9 09             CMP #$09
91A0: 90 03             BCC L91A5
91A2: A9 08             LDA #$08
91A4: C8                INY
91A5: 85 87    L91A5    STA $87
91A7: E6 87             INC $87
91A9: AE 3C 63          LDX $633C
91AC: E0 02             CPX #$02
91AE: B0 02             BCS L91B2
91B0: A0 06             LDY #$06
91B2: 84 88    L91B2    STY $88
91B4: 20 AA 8F          JSR $8FAA
91B7: AD 3C 63          LDA $633C
91BA: 18                CLC
91BB: 65 7A             ADC COLINC
91BD: 85 7A             STA COLINC
91BF: 90 02             BCC L91C3
91C1: E6 7B             INC SWPFLG
91C3: 18       L91C3    CLC
91C4: A5 7A             LDA COLINC
91C6: 6D 46 63          ADC $6346
91C9: 8D 46 63          STA $6346
91CC: A5 7B             LDA SWPFLG
91CE: 6D 45 63          ADC $6345
91D1: 8D 45 63          STA $6345
91D4: 18                CLC
91D5: A5 7A             LDA COLINC
91D7: 6D 48 63          ADC $6348
91DA: 8D 48 63          STA $6348
91DD: A5 7B             LDA SWPFLG
91DF: 6D 47 63          ADC $6347
91E2: 8D 47 63          STA $6347
91E5: A9 4A             LDA #$4A
91E7: 8D 95 A8          STA $A895
91EA: A9 07             LDA #$07
91EC: 85 96             STA $96
91EE: A9 02    L91EE    LDA #$02
91F0: 20 99 18          JSR $1899
91F3: 18                CLC
91F4: 69 01             ADC #$01
91F6: AE 95 A8          LDX $A895
91F9: 20 78 18          JSR $1878
91FC: A9 08             LDA #$08
91FE: 18                CLC
91FF: 6D 95 A8          ADC $A895
9202: 8D 95 A8          STA $A895
9205: C6 96             DEC $96
9207: D0 E5             BNE L91EE
9209: A9 02             LDA #$02
920B: 20 99 18          JSR $1899
920E: A2 81             LDX #$81
9210: 20 78 18          JSR $1878
9213: EE 3C 63          INC $633C
9216: 4C 61 91          JMP L9161