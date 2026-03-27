    ; Called each game hour (evey 4 seconds)
    ; - Updates the HP separator char (':' if less than max, '=' if max)
    ; - Computes the effective value for each primary stat (STA, CHR, STR,  INT, WIS, SKL, ???)
    ;

    43CF: ED 47 63          SBC CHR_HP_MAX_HI   ; Subtract max HP HI byte from A with carry (presumably A=0, no carry)
    43D2: 90 0E             BCC $43E2           ; If no carry (0 or neg?) jump to $43E2 (hmm... this is a bit odd,
                                                ;   since it would be the middle of an instruction. However, it would
                                                ;   be a valid opcode: LDA #$3A)
                        ; Copy the max HP value to the current HP
    43D4: A2 01             LDX #$01            ; Load 1 into X
    43D6: BD 47 63 HP_LOOP  LDA CHR_HP_MAX_HI,X     ; Read HP max val into A
    43D9: 9D 45 63          STA CHR_HP_CURRENT_HI,X ; Write A into HP current
    43DC: CA                DEX                 ; Subtract 1 from X (e.g. X = 0)
    43DD: 10 F7             BPL HP_LOOP         ; Loop while X >= 0 (e.g. Loops one time - copies both HI & LO bytes)
    43DF: A9 3D             LDA #$3D            ; Load $3D into A
    43E1: 2C A9 3A          BIT $3AA9           ; Bit AND value of A with value at $3AA9
                                                ;   ($3AA9 is the constant #$6f 'o' from string "opens")
                                                ;   This instruction is a bogus test, as the result is not used.
                                                ;   Its purpose seems to be an alternative to an unconditional jump
                                                ;   over an LDA #$3A instruction here ($43E2) which may be jumped to
                                                ;   directly from above. Confusing, but it works.
    43E4: 8D 99 04          STA $0499           ; Write A to $0499 (value stored is either $3D '=' or $3A ':')
    43E7: A9 49             LDA #$49            ; Store
    43E9: 85 58             STA SAVMSC          ;   $6349 (CHR_STA_EFFECTIVE)
    43EB: A9 63             LDA #$63            ;   at
    43ED: 85 59             STA SAVMSC+1        ;   SAVMSC ($0058)
    43EF: A2 06             LDX #$06            ; Load 6 into X (this is a loop counter - 6 primary stats)
                        ; Compute effective value for each of the primary stats
                        ;   effective = base - penalty1 - penalty2 - penalty3 - penalty4
    43F1: A0 01   STAT_LOOP LDY #$01            ; Load 1 into Y
    43F3: B1 58             LDA (SAVMSC),Y      ; Load value at (SAVMSC)+1 (stat base) into A
    43F5: 18                CLC                 ; Clear carry flag
    43F6: A0 02             LDY #$02            ; Load 2 into Y
    43F8: 71 58             ADC (SAVMSC),Y      ; Add value at (SAVMSC)+2 (stat bonus) to A
    43FA: 90 02             BCC $43FE           ; Skip next instruction if no carry
    43FC: A9 FF             LDA #$FF            ; Else store 255 into A
    43FE: 38                SEC                 ; Set the carry flag
    43FF: C8                INY                 ; Add 1 to Y (e.g. Y = 3)
    4400: F1 58             SBC (SAVMSC),Y      ; Subtract value at (SAVMSC)+3 (stat penalty 1) from A (C=1, so no borrow)
    4402: B0 02             BCS $4406           ; If no borrow (e.g. base + bonus - penalty1 >= 0), skip next instruction
    4404: A9 00             LDA #$00            ; Else, store 0 in A
    4406: C8                INY                 ; Add 1 to Y (e.g. Y = 4)
    4407: 38                SEC                 ; Set carry flag = 1 (no borrow)
    4408: F1 58             SBC (SAVMSC),Y      ; Subtract value at (SAVMSC)+4 (stat penalty 2) from A (C=1, so no borrow)
    440A: B0 02             BCS $440E           ; If no borrow, skip next instruction
    440C: A9 00             LDA #$00            ; Else, store 0 in A
    440E: C8                INY                 ; Add 1 to Y (e.g. Y = 5)
    440F: 38                SEC                 ; Set carry flag = 1 (no borrow)
    4410: F1 58             SBC (SAVMSC),Y      ; Subtract value at (SAVMSC)+5 (stat penalty 3) from A (C=1, so no borrow)
    4412: B0 02             BCS $4416           ; If no borrow, skip next instruction
    4414: A9 00             LDA #$00            ; Else, store 0 in A
    4416: C8                INY                 ; Add 1 to Y (e.g. Y = 6)
    4417: 38                SEC                 ; Set carry flag = 1 (no borrow)
    4418: F1 58             SBC (SAVMSC),Y      ; Subtract value at (SAVMSC)+6 (stat penalty 4) from A (C=1, so no borrow)
    441A: B0 02             BCS $441E           ; If no borrow, skip next instruction
    441C: A9 00             LDA #$00            ; Store 0 in A
    441E: A0 00             LDY #$00            ; Store 0 in Y
    4420: 91 58             STA (SAVMSC),Y      ; Store computed effective stat value at (SAVMSC)
                        ; Move to next stat entry (add 8 to addr stored in SAVMSC)
    4422: A9 08             LDA #$08            ; Store 8 in A
    4424: 18                CLC                 ; Clear carry flag
    4425: 65 58             ADC SAVMSC          ; Add value at SAVMSC to A
    4427: 85 58             STA SAVMSC          ; Store into SAVMSC
    4429: 90 02             BCC $442D           ; If no carry, skip next instruction
    442B: E6 59             INC SAVMSC+1        ; Else, add one to SAVMSC+1
    442D: CA                DEX                 ; Subtract 1 from X
    442E: 10 C1             BPL STAT_LOOP       ; Loop while X >= 0 (loop executes 7 times - 6 primary stats, 1 hidden stat)
    4430: AD 79 63          LDA $6379           ; Load value at $6379 (unknown char stat effective value)
    4433: 4A                LSR                 ; Divide
    4434: 4A                LSR                 ;   A
    4435: 4A                LSR                 ;   by
    4436: 4A                LSR                 ;   16
    4437: AA                TAX                 ; Store A in X
    4438: BD 5F 44          LDA $445F,X         ; Read A from table at $445F+X (16 bytes - values range from 06 to 12)
    443B: 8D 83 63          STA $6383           ; Store A into $6383
    443E: 2C 98 63          BIT CHR_STOMACH     ;
    4441: 10 03             BPL $4446
    4443: 4E 83 63          LSR $6383
    4446: AD 83 63          LDA $6383
    4449: C9 04             CMP #$04
    444B: B0 05             BCS $4452
    444D: A9 04             LDA #$04
    444F: 8D 83 63          STA $6383
    4452: AD 94 63          LDA CHR_BURDEN
    4455: C9 E0             CMP #$E0
    4457: 90 05             BCC $445E
    4459: A9 02             LDA #$02
    445B: 8D 83 63          STA $6383
    445E: 60                RTS