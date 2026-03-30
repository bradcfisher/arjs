35C1: AD 5A 19  DO_TELEPORT_PLAYER
                        LDA TELEPORT_INDEX          ; Load teleport index param into A (0-31)
35C4: 0A                ASL                         ; Multiply A by 4 to get table offset
35C5: 0A                ASL                         ;     (table entries are 4 bytes)
35C6: AA                TAX                         ; Store A into X
35C7: BD A7 3B          LDA TELEPORT_TBL_X,X        ; Load teleport X coordinate into A
35CA: 8D 13 63          STA CHR_LOC_X               ; Store X coordinate into player location X
35CD: BD A8 3B          LDA TELEPORT_TBL_Y,X        ; Load teleport Y coordinate into A
35D0: 8D 14 63          STA CHR_LOC_Y               ; Store Y coordinate into player location X
35D3: BD A9 3B          LDA TELEPORT_TBL_MAP,X      ; Load teleport map number into A
35D6: 8D 15 63          STA CHR_LOC_MAP             ; Store map # into player location map #
35D9: BD AA 3B          LDA TELEPORT_TBL_ORIENT,X   ; Load teleport orientation into A
35DC: 10 09             BPL TLPSKIP1                ; If A >= 0, skip next 4 instructions (explicit orientation)
35DE: C9 FF             CMP #$FF                    ; Test if A == $ff (-1)
35E0: F0 08             BEQ TLPSKIP2                ; If A == -1, skip next 3 instructions (leave current orientation)
35E2: AD 0A D2          LDA RANDOM                  ; Read random byte into A
35E5: 29 03             AND #$03                    ; Bit AND with 3 (A = 0..3) (random orientation)
35E7: 8D 12 63 TLPSKIP1 STA CHR_LOC_ORIENT          ; Store A into character orientation
                    ; The following section likely flashes the screen a few times
                    ; 1. Copy 5 bytes from 18BA to 5 byte temp area just past this sub.
                    ; 2. The value #$1A is loaded into the 5 bytes at 18BA
                    ; 3. Wait for 5 VBLKI to pass
                    ; 4. The value 0 is loaded into the 5 bytes at 18BA
                    ; 5. Wait for 5 VBLKI to pass
                    ; 6. Repeat 7 more iterations from 2 (e.g. 8 loops total)
                    ; 7 Restore the original 5 bytes to 18BA
35EA: A2 04    TLPSKIP2 LDX #$04                    ; Load 4 into X (loop 5 times)
35EC: BD BA 18 TLPCPYL1 LDA $18BA,X                 ; Copy current value from $18BA+X
35EF: 9D 30 36          STA $TLPTMPBUF,X            ;   into temp buffer storage
35F2: CA                DEX                         ; Subtract 1 from X
35F3: 10 F7             BPL TLPCPYL1                ; Loop while X >= 0 (5 iterations)
35F5: A0 08             LDY #$08                    ; Load 8 into Y (loops 8 times)
35F7: A9 1A    TLPFLSLP LDA #$1A                    ; Load #$1A (26 / %00011010) into A
35F9: A2 04             LDX #$04                    ; Load 4 into X (loops 5 times)
35FB: 9D BA 18 TLPCPYL2 STA $18BA,X
35FE: CA                DEX                         ; Subtract 1 from X
35FF: 10 FA             BPL TLPCPYL2                ; Loop while X >= 0 (5 iterations)
3601: 20 66 2C          JSR WAIT_FOR_VBLK_B         ; Wait for next vertical blank period
3604: A9 00             LDA #$00                    ; Load 0 into A
3606: A2 04             LDX #$04                    ; Load 4 into X (loop 5 times)
3608: 9D BA 18 TLPCPYL3 STA $18BA,X
360B: CA                DEX                         ; Subtract 1 from X
360C: 10 FA             BPL TLPCPYL3                ; Loop while X >= 0 (5 iterations)
360E: 20 66 2C          JSR WAIT_FOR_VBLK_B         ; Wait for next vertical blank period
3611: 88                DEY                         ; Subtract 1 from Y
3612: D0 E3             BNE TLPFLSLP                ; Loop while Y > 0 (8 iterations)
                    ; Restore 5 bytes previously copied to temp storage
3614: A2 04             LDX #$04                    ; Load 4 into X (loop 5 times)
3616: BD 30 36 TLPCPYL4 LDA TLPTMPBUF,X             ; Copy previous value from $18BA+X
3619: 9D BA 18          STA $18BA,X                 ;   back to $18BA+X
361C: CA                DEX                         ; Subtract 1 from X
361D: 10 F7             BPL TLPCPYL4                ; Loop while X >= 0 (5 iterations)
361F: A9 FF             LDA #$FF                    ; Load #$ff (-1) into A
3621: 8D 6A 19          STA $196A                   ;
3624: 8D 12 19          STA ZONE_ID                 ; Update current Zone ID to #$ff (-1) to trigger update
3627: 8D 38 19          STA $1938                   ;
362A: 8D 39 19          STA $1939                   ;
362D: 4C 8C 31          JMP $318C                   ;
;3630: 00 00 00 00 00 TLPTMPBUF                     ; 5 bytes of temporary storage