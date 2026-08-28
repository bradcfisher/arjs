
                ; 0000 L0a00 @8000 [exe]
                * = $8000

                ; Initializes IRQ handler vectors
                ;
                ; - Zeros all page 0 bytes
                ; - Assigns the following:
                ;   - VSEROC = $2297 [irq_VSEROC_2297]
                ;   - VSEROR = $224f [irq_VSEROR_224f]
                ;   - VSERIN = $21e7 [irq_VSERIN_21e7]
                ;   - VKEYBD = $2653 [irq_VKEYBD_2653]
                ;   - VIMIRQ = $22ac [irq_VIMIRQ_22ac]
                ;   - vblk_CRITIC = 0
                ;   - dat_0256 = 0
                ;   - CUR_SKCTL = 7
                ;   - CUR_IRQEN = $40 (64) [VKEYBD enabled]
                ;   - CurDList_L/H = $199d [DLIST_40x24] (40x25? 1bpp character display)
                ; - Enables VVBLKI (vertical blank) interrupts
                ; - Enables VKEYBD (keyboard) interrupts
                ;
8000: a9 40     initIrqs        LDA #$40             ; Set
8002: 8d 36 02                  STA CUR_IRQEN        ;     CUR_IRQEN = $40 (64) [VKEYBD enabled]
8005: a9 00                     LDA #$00             ; Set
8007: 8d 0e d2                  STA IRQEN            ;     IRQEN = 0 (Disable IRQs)
800a: 8d 0e d4                  STA NMIEN            ; Set NMIEN = 0 (Disable Non-Maskable IRQs (VBI, DLI, RESET))
800d: 8d 2f 02                  STA vblk_CRITIC      ; Set vblk_CRITIC = 0
8010: 8d 56 02                  STA dat_0256         ; Set dat_0256 = 0
8013: aa                        TAX                  ; Set X = 0
8014: 95 00     loc_8014        STA dat_0000,X       ; Zero out all
8016: e8                        INX                  ;     page 0
8017: d0 fb                     BNE loc_8014         ;     bytes
8019: a9 07                     LDA #$07             ; Set
801b: 8d 37 02                  STA CUR_SKCTL        ;     CUR_SKCTL = 7
801e: a9 97                     LDA #$97             ; Set [VSEROC] POKEY serial bus
8020: 8d 0e 02                  STA VSEROC           ;     transmit complete
8023: a9 22                     LDA #$22             ;     interrupt vector
8025: 8d 0f 02                  STA VSEROC+1         ;     to $2297 [irq_VSEROC_2297]
8028: a9 4f                     LDA #$4f             ; Set [VSEROR] POKEY serial I/O
802a: 8d 0c 02                  STA VSEROR           ;     transmit ready
802d: a9 22                     LDA #$22             ;     interrupt vetor
802f: 8d 0d 02                  STA VSEROR+1         ;     to $224f [irq_VSEROR_224f]
8032: a9 e7                     LDA #$e7             ; Set [VSERIN] POKEY serial I/O
8034: 8d 0a 02                  STA VSERIN           ;     bus receive data ready
8037: a9 21                     LDA #$21             ;     interrupt vector
8039: 8d 0b 02                  STA VSERIN+1         ;     to $21e7 [irq_VSERIN_21e7]
803c: a9 ac                     LDA #$ac             ; Set the [VIMIRQ]
803e: 8d 16 02                  STA VIMIRQ           ;     IRQ immediate
8041: a9 22                     LDA #$22             ;     interrupt vector
8043: 8d 17 02                  STA VIMIRQ+1         ;     to $22ac [irq_VIMIRQ_22ac]
8046: a9 53                     LDA #$53             ; Set the [VKEYBD]
8048: 8d 08 02                  STA VKEYBD           ;     POKEY keyboard
804b: a9 26                     LDA #$26             ;     interrupt vector
804d: 8d 09 02                  STA VKEYBD+1         ;     to $2653 [irq_VKEYBD_2653]
8050: a9 9d                     LDA #$9d             ; Set the
8052: 8d 54 02                  STA CurDList_L       ;     CurDList_L/H
8055: a9 19                     LDA #$19             ;     vector
8057: 8d 55 02                  STA CurDList_H       ;     to $199D [DLIST_40x24] (40x25? 1bpp character display)
805a: a9 47                     LDA #$47             ; Set the
805c: 8d 22 02                  STA VVBLKI           ;     VBLANK immediate
805f: a9 23                     LDA #$23             ;     interrupt vector
8061: 8d 23 02                  STA VVBLKI+1         ;     to $2347 [irq_VVBLKI_2347]
8064: 20 9e 81                  JSR sub_819e         ; Call $819e [sub_819e]
8067: ad 58 02                  LDA SysMemorySize    ; Set
806a: 0a                        ASL                  ;    A = (SysMemorySize >> 6) & 3   (Memory size table index: 0..3)
806b: 2a                        ROL                  ;    (e.g. Bits 6 & 7 -> bits 0 & 1)
806c: 2a                        ROL                  ;    ...
806d: 29 03                     AND #$03             ;    ...
806f: 20 58 81                  JSR copyMemSize      ; Call $8158 [copyMemSize]
8072: a9 40                     LDA #$40             ; Enable Non-Maskable
8074: 8d 0e d4                  STA NMIEN            ;     VBI Interrupts
8077: ad 36 02                  LDA CUR_IRQEN        ; ?? Still $40 at this point or is it modified by the sub call ??
807a: 8d 0e d2                  STA IRQEN            ; ?? If so, it would enable VKEYBD interrupts ??
807d: 60                        RTS                  ; Return to caller

                ; Entry point for system initialization
                ;
                ; - Sets character set to DungeonCharset
                ; - Sets display mode to 0 (plain 40x25 character display)
                ; - Enables VKEYBD interrupts
                ; - Calls sub_80d2
                ; - Transfers execution to kernelInit
                ;
807e: 20 00 80  kernelEntry     JSR initIrqs         ; Call $8000 [initIrqs] - Invoke IRQ initialization
8081: a9 14                     LDA #$14             ; Set CHBASE (character set font)
8083: 8d 09 d4                  STA CHBASE           ;     to $14 (20) (e.g. font is at $1400 [DungeonCharset])
8086: 20 bc 80                  JSR sub_80bc         ; Call $80bc [sub_80bc]
8089: 20 9f 80                  JSR sub_809f         ; Call $809f [sub_809f]
808c: a9 00                     LDA #$00             ; Set display mode to 0
808e: 20 0d 1a                  JSR setDisplayMode   ;     (plain 40x25 character display)
8091: a9 40                     LDA #$40             ; Set
8093: 8d 36 02                  STA CUR_IRQEN        ;     CUR_IRQEN = $40 (64) [VKEYBD enabled]
8096: 8d 0e d2                  STA IRQEN            ; Set IRQEN = $40 (64) [VKEYBD enabled]
8099: 20 d2 80                  JSR sub_80d2         ; Call $80d2 [sub_80d2]
809c: 4c c6 2e                  JMP $2ec6            ; Continue @ $2ec6 [KERNEL_INIT]

809f: a2 02     sub_809f        LDX #$02             ; Set X = 2
80a1: a9 00                     LDA #$00             ; Set A = 0
80a3: 9d c1 18  loc_80a3        STA SavedOutCol,X    ; Loop
                                                     ;     Set SavedOutCol,X = 0
80a6: 9d c4 18                  STA SavedOutRow,X    ;     Set SavedOutRow,X = 0
80a9: 9d c7 18                  STA SavedOutBlink,X  ;     Set SavedOutBlink,X = 0
80ac: ca                        DEX                  ;     Subtract 1 from X
80ad: 10 f4                     BPL loc_80a3         ; Repeat while (X >= 0)
80af: 85 1f                     STA OutCol           ; Set OutCol = 0
80b1: 85 20                     STA OutCol           ; Set OutCol = 0
80b3: 85 21                     STA OutBlink         ; Set OutBlink = 0
80b5: 85 25                     STA OutAlignLen      ; Set OutAlignLen = 0
80b7: 85 24                     STA OutAlign         ; Set OutAlign = 0
80b9: 85 26                     STA OutAlignEolFlg   ; Set OutAlignEolFlg = 0
80bb: 60                        RTS                  ; Return to caller

                ; Initializes keyboard and stick input registers
                ;
                ; Sets the following:
                ;   KBD_CONSOL  = 7 (no console keys pressed)
                ;   dat_0265    = 0
                ;   StickStatus = 0 (centered, no trigger)
                ;   StickKbdDir = 0 (centered, no trigger)
                ;   $18ff       = 0
                ;   KbdPendChar = $ff (no key available)
                ;
80bc: a9 07     sub_80bc        LDA #$07             ; Set
80be: 8d 00 19                  STA KBD_CONSOL       ;     KBD_CONSOL = 7 (no console keys pressed)
80c1: a9 00                     LDA #$00             ; Set
80c3: 8d 65 02                  STA dat_0265         ;     $0265 [dat_0265] = 0
80c6: 85 2e                     STA StickStatus      ; Set StickStatus = 0 (centered, no trigger)
80c8: 8d ff 18                  STA $18ff            ; Set $18ff = 0
80cb: 85 2f                     STA StickKbdDir      ; Set StickKbdDir = 0 (centered, no trigger)
80cd: a9 ff                     LDA #$ff             ; Set
80cf: 85 30                     STA KbdPendChar      ;     KbdPendChar = $ff (no key available)
80d1: 60                        RTS                  ; Return to caller

                ;
                ; - Displays the "System Initialization" text, included detected usable RAM size
                ; - For disks 1 through 4
                ;   -
                ;
80d2: a2 1f     sub_80d2        LDX #$1f             ; Set X = $1f (31)
80d4: bd 6a 81  loc_80d4        LDA SystemInit,X     ; Loop                  (Copy SystemInit message to display buffer)
80d7: 9d 7c 19                  STA DispBuf40x1,X    ;     Set DispBuf40x1[X] = SystemInit[X]
80da: ca                        DEX                  ;     Subtract 1 from X
80db: 10 f7                     BPL loc_80d4         ; Repeat while (X >= 0)
80dd: 20 5d 24                  JSR sub_245d         ; Call $245d [sub_245d]  (Reset IRQs, keyboard, display colors, audio)
80e0: a2 03     loc_80e0        LDX #$03             ; Loop
80e2: 86 06                     STX dat_0006         ;     Set dat_0006 = 3  (4 iterations - disk # 3..0)
80e4: a6 06     loc_80e4        LDX dat_0006         ;     Loop
                                                     ;         Set X = dat_0006
80e6: a9 ff                     LDA #$ff             ;         Set
80e8: 9d 4e 02                  STA dat_024e,X       ;             dat_024e[X] = $ff
80eb: e8                        INX                  ;         Add 1 to X
80ec: 8a                        TXA                  ;         Set A
80ed: 29 0f                     AND #$0f             ;               =
80ef: 09 30                     ORA #$30             ;                 (X & $f) | $30
80f1: 8d 30 02                  STA DiskNumber       ;         Set DiskNumber = A        (A = [$34 "4".. $31 "1"])
80f4: 20 a3 24                  JSR readDiskStatus   ;         Call $24a3 [readDiskStatus]
80f7: 30 0b                     BMI loc_8104         ;         If (N = 0) Then
80f9: a6 06                     LDX dat_0006         ;             Set X = dat_0006
80fb: bd 8a 81                  LDA SysInitMem,X     ;             Set
80fe: 9d 98 19                  STA DispBuf40x1+28,X ;                 DispBuf40x1[28 + X] = SysInitMem[X]  (X = 3..0)
8101: fe 4e 02                  INC dat_024e,X       ;             Add 1 to dat_024e[X]
                                                     ;         End If
8104: c6 06     loc_8104        DEC dat_0006         ;         Subtract 1 from dat_0006
8106: 10 dc                     BPL loc_80e4         ;     Repeat while (dat_0006 >= 0)
8108: bd 4e 02                  LDA dat_024e,X       ; Repeat
810b: 30 d3                     BMI loc_80e0         ;   while (dat_024e[X] < 0)
                ;
                ; Read the file segment directory to $0280 [FILE_SEG_DIR]
                ;
                ; - Reads 4 sectors from drive #1 starting at sector 2
                ;     (sectors 2..6 (512 bytes)) to $0280 [FILE_SEG_DIR]
                ;
810d: a9 31                     LDA #$31             ; Set
810f: 8d 30 02                  STA DiskNumber       ;     DiskNumber = $31 (49 '1')  (read from drive #1)
8112: a9 04                     LDA #$04             ; Set
8114: 85 06                     STA dat_0006         ;     dat_0006 = 4               (4 iterations/sectors - 4..1)
8116: a9 80                     LDA #$80             ; Set
8118: 85 09                     STA dat_0009_L       ;     dat_0009_L/H               (set destination address)
811a: a9 02                     LDA #$02             ;     to
811c: 85 0a                     STA dat_0009_H       ;     $0280 [FILE_SEG_DIR]
811e: a9 02                     LDA #$02             ; Set
8120: 8d 01 25                  STA dat_2501_L       ;     dat_2501_L/H               (set starting sector)
8123: a9 00                     LDA #$00             ;     to
8125: 8d 02 25                  STA dat_2501_H       ;     $0002 (disk sector 2)
8128: ad 01 25  loc_8128        LDA dat_2501_L       ; Loop
812b: 8d 32 02                  STA DiskSector_L     ;     Set DiskSector_L/H         (set current sector to read)
812e: ad 02 25                  LDA dat_2501_H       ;         to
8131: 8d 33 02                  STA DiskSector_H     ;         dat_2501_L/H
8134: 20 8e 24  loc_8134        JSR readDiskSector   ;     Loop
                                                     ;         Call $248e [readDiskSector]
8137: 30 fb                     BMI loc_8134         ;     Repeat while (N = 1)       (don't take "no"/err as an answer)
8139: a0 00                     LDY #$00             ;     Set Y = 0                  (copies 256 bytes? sector is 128)
813b: b9 00 01  loc_813b        LDA SioBuf,Y         ;     Loop                       (copy sector to destination)
813e: 91 09                     STA (dat_0009_L),Y   ;         Set (*dat_0009_L)[Y] = SioBuf[Y]
8140: c8                        INY                  ;         Subtract 1 from Y
8141: 10 f8                     BPL loc_813b         ;     Repeat while (Y >= 0)
8143: a5 09                     LDA dat_0009_L       ;     Set                        (move destination address forward
8145: 18                        CLC                  ;         dat_0009_L              by 128 bytes)
8146: 69 80                     ADC #$80             ;            =
8148: 85 09                     STA dat_0009_L       ;              dat_0009_L + $80  (C = 1 on overflow, 0 otherwise)
814a: 90 02                     BCC loc_814e         ;     If (C = 1) Then
814c: e6 0a                     INC dat_0009_H       ;         Add 1 to dat_0009_H
                                                     ;     End If
814e: ee 01 25  loc_814e        INC dat_2501_L       ;     Add 1 to dat_2501_L        (select next sector)
8151: c6 06                     DEC dat_0006         ;     Subtract 1 from dat_0006
8153: d0 d3                     BNE loc_8128         ; Repeat while (dat_0006 != 0)
8155: 4c d8 27                  JMP sub_27d8         ; Continue @ $27d8 [sub_27d8]

                ; Copies a memory size string from MemSizeTbl into the last 4 bytes of SystemInit
                ;
                ; Input
                ;   A   - Index of the memory size string to copy
                ;           0 - " 48K"
                ;           1 - " ??K"
                ;           2 - " 64K"
                ;           3 - "128K"
                ;
8158: 0a        copyMemSize     ASL                  ; Divide
8159: 0a                        ASL                  ;     A by 4
815a: aa                        TAX                  ; Set X = A
815b: a0 00                     LDY #$00             ; Set Y = 0
815d: bd 8e 81  loc_815d        LDA MemSizeTbl,X     ; Loop
8160: 99 6a 81                  STA SystemInit,Y     ;     Set SystemInit[Y] = MemSizeTbl[X]
8163: e8                        INX                  ;     Add 1 to X
8164: c8                        INY                  ;     Add 1 to Y
8165: c0 04                     CPY #$04             ; Repeat
8167: 90 f4                     BCC loc_815d         ;   while (Y < 4)
8169: 60                        RTS                  ; Return to caller

816a: 20 20 20  SystemInit      .BYTE $20,$20,$20                      ; "   "
816d: 20 20 53 79 73 74 65 6d   .BYTE $20,$20,$53,$79,$73,$74,$65,$6d  ; "  System"
8175: 20 49 6e 69 74 69 61 6c   .BYTE $20,$49,$6e,$69,$74,$69,$61,$6c  ; " Initial"
817d: 69 7a 61 74 69 6f 6e 20   .BYTE $69,$7a,$61,$74,$69,$6f,$6e,$20  ; "ization "
8185: 20 20 20 20 20            .BYTE $20,$20,$20,$20,$20              ; "     "
818a: 31 32 33 34  SysInitMem   .BYTE $31,$32,$33,$34                  ; "1234"

818e: 20 34 38 4b  MemSizeTbl   .BYTE $20,$34,$38,$4b                  ; " 48K"
8192: 20 3f 3f 4b               .BYTE $20,$3f,$3f,$4b                  ; " ??K"
8196: 20 36 34 4b               .BYTE $20,$36,$34,$4b                  ; " 64K"
819a: 31 32 38 4b               .BYTE $31,$32,$38,$4b                  ; "128K"

                ; Detects the system memory size and ??
                ;
                ; Pressing the SELECT console button by itself will skip the initialization completely.
                ; Pressing the OPTION console button by itself will skip only a portion of the intialization.
                ;
                ; Output
                ;   SysMemorySize -   0 ( 48K) if no RAM over 48K or the SELECT button was pressed by itself
                ;                   $80 ( 64K) if ?? ROM is not disabled ?? and the OPTION button is pressed by itself
                ;                   $c0 (128K) if ??
                ;
                ; PORTB (XL/130XE)
                ; ----------
                ; $fe = 1 1 1 1 1 1 1 0	- Disables ROM ($c000-$cfff, $d800-$ffff), BASIC disabled
                ; $e2 = 1 1 1 0 0 0 1 0 - Disables ROM ($c000-$cfff, $d800-$ffff), BASIC disabled, CPU bank #0 enabled
                ;       ---------------
                ;       7 6 5 4 3 2 1 0
                ;       | | | | | | | +- 0 - (XL) Disable ROM ($c000-$cfff, $d800-$ffff), 1 - ROM enabled
                ;       | | | | | | +--- 0 - (XL) BASIC enabled, 1 - BASIC disabled
                ;       | | | | | +----- N/A - 1200XL LED / 130XE bank switching (LSb of bank address)
                ;       | | | | +------- N/A - 1200XL LED / 130XE bank switching (MSb of bank address)
                ;       | | | +--------- N/A - 130XE CBE: CPU bank enable   (0 - enabled ($4000-$7FFF), 1 - disabled)
                ;       | | +----------- N/A - 130XE VBE: Video bank enable (0 - enabled ($4000-$7FFF), 1 - disabled)
                ;       | +------------- unused
                ;       +--------------- 0 - (XL) ROM enabled ($5000-$57FF), 1 - ROM disabled
                ;
819e: 78        sub_819e        SEI                  ; Set interrupt disable status
819f: a9 00                     LDA #$00             ; Set
81a1: 8d 58 02                  STA SysMemorySize    ;     SysMemorySize = 0       (assume 48K - 400/800/XL)
81a4: ad 1f d0                  LDA CONSOL           ; If
81a7: c9 05                     CMP #$05             ;    (CONSOL != 5)            (SELECT button NOT pressed by itself)
81a9: f0 76                     BEQ loc_8221         ; Then
81ab: a9 fe                     LDA #$fe             ;     Set
81ad: 8d 01 d3                  STA PORTB            ;         PORTB = $fe              (XL: Disables ROM @ $C000-$CFFF)
                ; The following appears to check whether the memory location at $d800 is RAM by attempting to
                ; update the value and immediately testing whether it changed or not.
                ; RAM would reflect the update while ROM would retain the original value.
81b0: ad 00 d8                  LDA OsRomStart       ;     Set A = OsRomStart           (first byte of OS ROM)
81b3: aa                        TAX                  ;     Set
81b4: e8                        INX                  ;         X = A + 1
81b5: 8e 00 d8                  STX OsRomStart       ;     Set OsRomStart = X
81b8: ec 00 d8                  CPX OsRomStart       ;     If
81bb: d0 5f                     BNE loc_821c         ;        (X == OsRomStart)      (OsRomStart was updated)
81bd: ca                        DEX                  ;        AND                    (X not used after decrementing?)
81be: cd 00 d8                  CMP OsRomStart       ;        (A != OsRomStart)      (OsRomStart was updated - why do this?)
81c1: f0 59                     BEQ loc_821c         ;     Then
81c3: a9 23                     LDA #$23             ;         Set copy source address
81c5: 85 07                     STA SourceAdr_L      ;             SourceAdr_L/H
81c7: a9 82                     LDA #$82             ;             to
81c9: 85 08                     STA SourceAdr_H      ;             $8223 [sub_8223]
81cb: a9 00                     LDA #$00             ;         Set copy destination address
81cd: 85 09                     STA dat_0009_L       ;             dat_0009_L/H
81cf: a9 f9                     LDA #$f9             ;             to
81d1: 85 0a                     STA dat_0009_H       ;             $f900 [sub_f900]
81d3: a2 07                     LDX #$07             ;         Set X = 7
81d5: a0 00                     LDY #$00             ;         Set Y = 0              (copy $700 (1792) bytes)
81d7: 20 0d 2e                  JSR copyBytes        ;         Call $2e0d [copyBytes]
81da: a9 80                     LDA #$80             ;         Set
81dc: 8d 58 02                  STA SysMemorySize    ;            SysMemorySize = $80 (64K)
81df: ad 1f d0                  LDA CONSOL           ;         If
81e2: c9 03                     CMP #$03             ;            (CONSOL != 3)    (OPTION button not pressed by itself)
81e4: f0 36                     BEQ loc_821c         ;         Then
81e6: ae 00 40                  LDX ExtRam130XE      ;             Set X = ExtRam130XE        (130XE extended bank addr)
81e9: 86 04                     STX TempByte         ;             Set TempByte = X            (save val for cmp later)
81eb: a9 e2                     LDA #$e2             ;             Set
81ed: 8d 01 d3                  STA PORTB            ;                 PORTB = $e2      (130XE enable bank switching)
81f0: e8                        INX                  ;             Add 1 to X           (Attempt to update the byte
81f1: 8e 00 40                  STX ExtRam130XE      ;             Set ExtRam130XE = X   at $4000)
81f4: a9 fe                     LDA #$fe             ;             Set                  (Switch back to normal RAM)
81f6: 8d 01 d3                  STA PORTB            ;                 PORTB = $fe      (XL: Disables ROM @ $C000-$CFFF)
81f9: ec 00 40                  CPX ExtRam130XE      ;             If (X == ExtRam130XE)
81fc: d0 07                     BNE loc_8205         ;             Then                 (The update went to normal RAM)
81fe: ca                        DEX                  ;                 Subtract 1 from X     (Revert to original value)
81ff: 8e 00 40                  STX ExtRam130XE      ;                 Set ExtRam130XE = X
8202: 4c 1c 82                  JMP loc_821c         ;             Else   (Normal RAM not updated, went to extended RAM)
8205: a9 e2     loc_8205        LDA #$e2             ;                 Set
8207: 8d 01 d3                  STA PORTB            ;                     PORTB = $e2  (130XE enable bank switching)
                ; Note the following test may be buggy, as it tries to decrement $4000 (which would revert the
                ; value if it had been updated previously) and then tests it against the original value
                ; retrieved earlier.
                ; However, if $4000 were ROM, it would not have updated above nor here and would still match the
                ; original value.
                ; It may have been better to have also checked the value of $4000 against the modified value
                ; before reverting it to ensure the value actually did change. Or perhaps the original value
                ; check simply isn't necessary if it makes it to this point.
820a: ce 00 40                  DEC ExtRam130XE      ;                 Subtract 1 from ExtRam130XE  (Attempt to update
820d: ae 00 40                  LDX ExtRam130XE      ;                 Set X = ExtRam130XE           the byte at $4000)
8210: e4 04                     CPX TempByte         ;                 If (X == TempByte)
8212: d0 08                     BNE loc_821c         ;                 Then                         (matches orig val)
8214: a9 c0                     LDA #$c0             ;                     Set
8216: 8d 58 02                  STA SysMemorySize    ;                        SysMemorySize = $c0   (128K or more)
8219: 20 cf f9                  JSR sub_f9cf         ;                     Call $f9cf [sub_f9cf]
                                                     ;                 End If
                                                     ;             End If
                                                     ;         End If
                                                     ;     End If
821c: a9 fe     loc_821c        LDA #$fe             ;     Set
821e: 8d 01 d3                  STA PORTB            ;         PORTB = $fe              (XL: Disables ROM @ $C000-$CFFF)
                                                     ; End If
8221: 58        loc_8221        CLI                  ; Clear the interrupt disable status
8222: 60                        RTS                  ; Return to caller

                ; ----------------------------------------------------------------
                ; The following $700 (1792) bytes are copied to $f900 by sub_819e
                ; if the system has 64KB RAM or more.
                ; vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv

                ; Copies one or two blocks of memory, depending on the value of FileNumber.
                ;
                ; When (FileNumber < 8):
                ;   - Copies 4096 bytes from $ac00 [MAP_Number] to $c000 [MAP_Copy]
                ;   - Copies 1024 bytes from $bc00 [TODO: label] to $d800 [TODO: label]
                ; Otherwise:
                ;   - Copies 5392 bytes from $96f0 [TEX_Headers] to $dc00 [TEX_Copy]
                ;
                ; Copied to $f900 [sub_f900] (add $76dd to addrs)
                ; This sub is the inverse of sub_f953.
                ;
                ; Input
                ;   FileNumber   -
                ;
                ; Output
                ;   SavedFileNum - Assigned the value in FileNumber when FileNumber >= 8 (Texture or other file)
                ;   SavedMapNum  - Assigned the value in FileNumber when FileNumber < 8  (Map file)
                ;   C            - cleared on return
                ;
8223: ad 09 19  sub_8223        LDA FileNumber       ; If
8226: c9 08                     CMP #$08             ;    (FileNumber < 8)
8228: b0 30                     BCS loc_825a         ; Then                   (file is a map)
822a: 8d ce f9                  STA SavedMapNum      ;     Set SavedMapNum = FileNumber
822d: a9 00                     LDA #$00             ;     Set copy source address
822f: 85 07                     STA SourceAdr_L      ;         SourceAdr_L/H
8231: a9 ac                     LDA #$ac             ;         to
8233: 85 08                     STA SourceAdr_H      ;         $ac00 [MAP_Number]
8235: a9 00                     LDA #$00             ;     Set copy destination address
8237: 85 09                     STA dat_0009_L       ;         dat_0009_L/H
8239: a9 c0                     LDA #$c0             ;         to
823b: 85 0a                     STA dat_0009_H       ;         $c000 [MAP_Copy]
823d: a2 10                     LDX #$10             ;     Set X = $10
823f: a0 00                     LDY #$00             ;     Set Y = 0          (bytes to copy = $1000 (4096))
8241: 20 0d 2e                  JSR copyBytes        ;     Call $2e0d [copyBytes]
8244: a9 00                     LDA #$00             ;     Set copy source address
8246: 85 07                     STA SourceAdr_L      ;         SourceAdr_L/H
8248: a9 bc                     LDA #$bc             ;         to
824a: 85 08                     STA SourceAdr_H      ;         $bc00 [TODO: label]
824c: a9 00                     LDA #$00             ;     Set copy destination address
824e: 85 09                     STA dat_0009_L       ;         dat_0009_L/H
8250: a9 d8                     LDA #$d8             ;         to
8252: 85 0a                     STA dat_0009_H       ;         $d800 [TODO: label]
8254: a2 04                     LDX #$04             ;     Set X = 4
8256: a0 00                     LDY #$00             ;     Set Y = 0          (bytes to copy = $0400 (1024))
8258: f0 17                     BEQ loc_8271         ; Else                   (File is not a map)
825a: 8d cd f9  loc_825a        STA SavedFileNum     ;     Set SavedFileNum = FileNumber
825d: a9 f0                     LDA #$f0             ;     Set copy source address
825f: 85 07                     STA SourceAdr_L      ;         SourceAdr_L/H
8261: a9 96                     LDA #$96             ;         to
8263: 85 08                     STA SourceAdr_H      ;         $96f0 [TEX_Headers]
8265: a9 00                     LDA #$00             ;     Set copy destination address
8267: 85 09                     STA dat_0009_L       ;         dat_0009_L/H
8269: a9 dc                     LDA #$dc             ;         to
826b: 85 0a                     STA dat_0009_H       ;         $dc00 [TEX_Copy]
826d: a2 15                     LDX #$15             ;     Set X = $15
826f: a0 10                     LDY #$10             ;     Set Y = $10        (bytes to copy = $1510 (5392))
                                                     ; End If
8271: 20 0d 2e  loc_8271        JSR copyBytes        ; Call $2e0d [copyBytes]
8274: 18                        CLC                  ; Set C = 0
8275: 60                        RTS                  ; Return to caller

                ; Copies one or two blocks of memory, depending on the values of FileNumber, SavedFileNum and SavedMapNum.
                ;
                ; When FileNumber < 8:
                ;   If FileNumber = SavedMapNum:
                ;     - Copies 4096 bytes from $ac00 [MAP_Number] to $c000 [MAP_Copy]
                ;     - Copies 1024 bytes from $bc00 [TODO: label] to $d800 [TODO: label]
                ; Otherwise, if FileNumber >= 8:
                ;   If FileNumber = SavedFileNum:
                ;     - Copies 5392 bytes from $96f0 [TEX_Headers] to $dc00 [TEX_Copy]
                ;
                ; Copied to $f953 [sub_f953] (add $76dd to addrs)
                ; This sub is the inverse of sub_f900.
                ;
                ; Input
                ;   FileNumber   -
                ;   SavedFileNum - When FileNumber >= 8, this value must match FileNumber
                ;   SavedMapNum  - When FileNumber < 8, this value must match FileNumber
                ;
                ; Output
                ;   C            - 0 if the preconditions were met and the copy occurred,
                ;                  1 if the preconditions were NOT met and no copy was performed.
                ;
8276: ad 09 19                  LDA FileNumber       ; If
8279: c9 08                     CMP #$08             ;    (FileNumber < 8)
827b: b0 32                     BCS loc_82af         ; Then
827d: cd ce f9                  CMP SavedMapNum      ;     If (FileNumber == SavedMapNum)
8280: d0 4b                     BNE loc_82cd         ;     Then
8282: a9 00                     LDA #$00             ;         Set copy source address
8284: 85 07                     STA SourceAdr_L      ;             SourceAdr_L/H
8286: a9 c0                     LDA #$c0             ;             to
8288: 85 08                     STA SourceAdr_H      ;             $c000 [MAP_Copy]
828a: a9 00                     LDA #$00             ;         Set copy destination address
828c: 85 09                     STA dat_0009_L       ;             dat_0009_L/H
828e: a9 ac                     LDA #$ac             ;             to
8290: 85 0a                     STA dat_0009_H       ;             $ac00 [MAP_Number]
8292: a2 10                     LDX #$10             ;         Set X = $10
8294: a0 00                     LDY #$00             ;         Set Y = 0      (bytes to copy = $1000 (4096))
8296: 20 0d 2e                  JSR copyBytes        ;         Call $2e0d [copyBytes]
8299: a9 00                     LDA #$00             ;         Set copy source address
829b: 85 07                     STA SourceAdr_L      ;             SourceAdr_L/H
829d: a9 d8                     LDA #$d8             ;             to
829f: 85 08                     STA SourceAdr_H      ;             $d800 [TODO: label]
82a1: a9 00                     LDA #$00             ;         Set copy destination address
82a3: 85 09                     STA dat_0009_L       ;             dat_0009_L/H
82a5: a9 bc                     LDA #$bc             ;             to
82a7: 85 0a                     STA dat_0009_H       ;             $bc00 [TODO: label]
82a9: a2 04                     LDX #$04             ;         Set X = 4
82ab: a0 00                     LDY #$00             ;         Set Y = 0      (bytes to copy = $0400 (1024))
82ad: f0 19                     BEQ loc_82c8         ;         Continue @ $82c8 [loc_82c8] (execute copyBytes & success)
                                                     ;     End If
82af: cd cd f9  loc_82af        CMP SavedFileNum     ; Else If (FileNumber == SavedFileNum)
82b2: d0 19                     BNE loc_82cd         ; Then
82b4: a9 00                     LDA #$00             ;     Set copy source address
82b6: 85 07                     STA SourceAdr_L      ;         SourceAdr_L/H
82b8: a9 dc                     LDA #$dc             ;         to
82ba: 85 08                     STA SourceAdr_H      ;         $dc00 [TEX_Copy]
82bc: a9 f0                     LDA #$f0             ;     Set copy destination address
82be: 85 09                     STA dat_0009_L       ;         dat_0009_L/H
82c0: a9 96                     LDA #$96             ;         to
82c2: 85 0a                     STA dat_0009_H       ;         $96f0 [TEX_Headers]
82c4: a2 15                     LDX #$15             ;     Set X = $15
82c6: a0 10                     LDY #$10             ;     Set Y = $10        (bytes to copy = $1510 (5392))
82c8: 20 0d 2e  loc_82c8        JSR copyBytes        ;     Call $2e0d [copyBytes]
82cb: 18                        CLC                  ;     Set C = 0
82cc: 60                        RTS                  ;     Return to caller (success)
                                                     ; End If
82cd: 38        loc_82cd        SEC                  ; Set C = 1
82ce: 60                        RTS                  ; Return to caller (error)

                ; TODO: how is this code invoked?
                ;
                ; It looks like a Non-Maskable Interrupt handler
                ;
                ; Copied to $f9ac [irq_NMI_f9ac] (add $76dd to addrs)
                ;
82cf: 2c 0f d4                  BIT NMIST            ; If (bit 7 of NMIST == 1)     (Bit 7 set: Display list interrupt)
82d2: 10 03                     BPL loc_82d7         ; Then
82d4: 6c 00 02                  JMP (VDSLST)         ;     Continue @ (*VDSLST)
                                                     ; End If
82d7: 48        loc_82d7        PHA                  ; Push A onto stack
82d8: ad 0f d4                  LDA NMIST            ; If
82db: 29 20                     AND #$20             ;    (NMIST & $20 != 0)        (Bit 5 set: RESET interrupt)
82dd: f0 03                     BEQ loc_82e2         ; Then
82df: 4c 00 d8                  JMP OsRomStart       ;     Continue @ $d800 [OsRomStart]
                                                     ; End If
82e2: 8a        loc_82e2        TXA                  ; Push
82e3: 48                        PHA                  ;      X onto stack
82e4: 98                        TYA                  ; Push
82e5: 48                        PHA                  ;      Y onto stack
82e6: 8d 0f d4                  STA NMIRES           ; Set NMIRES = Y
82e9: 6c 22 02                  JMP (VVBLKI)         ; Continue @ (*VVBLKI)

                ; TODO: How is this code invoked?
                ;
                ; Copied to $f9c9 [irq_VIMIRQ_f9c9] (add $76dd to addrs)
82ec: d8                        CLD                  ; Set D = 0     (clear decimal mode flag)
82ed: 6c 16 02                  JMP (VIMIRQ)         ; Continue @ (*VIMIRQ)

                ; Copied to $f9cd [SavedFileNum]
82f0: ff                        .BYTE $ff            ; Holds the original value of FileNumber if >= 8

                ; Copied to $f9ce [SavedMapNum]
82f1: ff                        .BYTE $ff            ; Holds the original value of FileNumber if < 8

                ;
                ; Initializes:
                ;   - dat_fba5[0..254] = 1..255
                ;   - dat_fca4 = 0
                ;   - dat_fca5[1..255] = 0..254
                ;   - dat_fda5[1..254] = $ff (255)
                ;   - dat_fea5[1..254] = $ff (255)
                ;
                ; Copied to $f9cf [sub_f9cf] (add $76dd to addrs)
                ;
82f2: a2 ff                     LDX #$ff             ; Set X = $ff (255 iterations)
82f4: 8a        loc_82f4        TXA                  ; Loop
                                                     ;    Set A = X
82f5: ca                        DEX                  ;    Subtract 1 from X
82f6: 9d a5 fb                  STA dat_fba5,X       ;    Set dat_fba5[X] = A       (dat_fba5[0..254] = 1..255)
82f9: d0 f9                     BNE loc_82f4         ; Repeat while (X != 0)
82fb: 8e a4 fc                  STX dat_fca4         ; Set dat_fca4 = X             (X = 0, dat_fca4 = 0)
82fe: a2 00                     LDX #$00             ; Set X = 0 (255 iterations)
8300: 8a        loc_8300        TXA                  ; Loop
                                                     ;     Set A = X
8301: e8                        INX                  ;     Add 1 to X
8302: 9d a5 fc                  STA dat_fca5,X       ;     Set dat_fca5[X] = A      (dat_fca5[1..255] = 0..254)
8305: e0 ff                     CPX #$ff             ; Repeat
8307: d0 f7                     BNE loc_8300         ;   while (X != $ff)
8309: a9 ff                     LDA #$ff             ; Set A = $ff (255)
830b: a2 fe                     LDX #$fe             ; Set X = $fe (254 iterations)
830d: 9d a5 fd  loc_830d        STA dat_fda5,X       ; Loop
                                                     ;     Set dat_fda5[X] = A      (dat_fda5[1..254] = $ff (255))
8310: 9d a5 fe                  STA dat_fea5,X       ;     Set dat_fea5[X] = A      (dat_fea5[1..254] = $ff (255))
8313: ca                        DEX                  ;     Subtract 1 from X
8314: d0 f7                     BNE loc_830d         ; Repeat while (X != 0)
8316: 60                        RTS                  ; Return to caller

                ;
                ; - If the selected disk sector is even, sets:
                ;      dat_025d = $80
                ;      dat_025e/dat_025f = DiskSector_L/H - 1
                ;      dat_0260/dat_0261 = DiskSector_L/H - 1
                ;   Otherwise, if the selected disk sector is odd, sets:
                ;      dat_025d = 0
                ;      dat_025e/dat_025f = DiskSector_L/H
                ;      dat_0260/dat_0261 = DiskSector_L/H + 1
                ;
                ; Copied to $f9f4 [sub_f9f4] (add $76dd to addrs)
                ;
                ; Output
                ;   Y   - 1 = Success
                ;         $ff = Failure
                ;   N   - 0 = Success
                ;         1 = Failure
                ;
                ; Temp
                ;   dat_0262_L/H  - Set to input DiskSector_L/H
                ;
8317: a9 80                     LDA #$80             ; Set
8319: 8d 5d 02                  STA dat_025d         ;     dat_025d = $80 (128)
831c: ac 33 02                  LDY DiskSector_H     ; Set Y = DiskSector_H
831f: 8c 63 02                  STY dat_0262_H       ; Set dat_0262_H = Y
8322: ad 32 02                  LDA DiskSector_L     ; Set A = DiskSector_L
8325: 8d 62 02                  STA dat_0262_L       ; Set dat_0262_L = A       (dat_0262_L/H = DiskSector_L/H)
                ; Check is sector is even/odd and assign dat_025d, dat_025e/dat_025f and dat_0260/dat_0261
8328: 4a                        LSR                  ; If
8329: b0 16                     BCS loc_8341         ;    (bit 0 of A == 0)     (sector number is even)
832b: 2a                        ROL                  ; Then
832c: 38                        SEC                  ;     Set                  (A is DiskSector_L before op)
832d: e9 01                     SBC #$01             ;         A = A - 1        (C = 0 on underflow otherwise 1)
832f: 8d 60 02                  STA dat_0260         ;     Set dat_0260 = A
8332: 8d 5e 02                  STA dat_025e         ;     Set dat_025e = A
8335: 98                        TYA                  ;     Set
8336: e9 00                     SBC #$00             ;         A = Y - ~C       (Y = DiskSector_H)
8338: 8d 61 02                  STA dat_0261         ;     Set dat_0261 = A     (dat_0260/dat_0261 = DiskSector_L/H - 1)
833b: 8d 5f 02                  STA dat_025f         ;     Set dat_025f = A     (dat_025e/dat_025f = DiskSector_L/H - 1)
833e: 4c 33 fa                  JMP cont_fa33        ;     (Note: This addr is after copy, $8356 below is local target)
8341: 2a        loc_8341        ROL                  ; Else                     (C = 0 after, as 0 was shifted in above)
8342: 8d 5e 02                  STA dat_025e         ;     Set dat_025e = A     (A = DiskSector_L)
8345: 8c 5f 02                  STY dat_025f         ;     Set dat_025f = Y     (dat_025e/dat_025f = DiskSector_L/H)
8348: 69 01                     ADC #$01             ;     Set
834a: 8d 60 02                  STA dat_0260         ;         dat_0260 = A + 1 (C = 1 on overflow else 0)
834d: 90 01                     BCC loc_8350         ;     If (C == 1) Then
834f: c8                        INY                  ;         Add 1 to Y       (Y = DiskSector_H + 1)
                                                     ;     End If
8350: 8c 61 02  loc_8350        STY dat_0261         ;     Set dat_0261 = Y     (dat_0260/dat_0261 = DiskSector_L/H + 1)
8353: 0e 5d 02                  ASL dat_025d         ;     Set dat_025d = dat_025d * 2   (dat_025d = 0, C = 1)
                                                     ; End If   (Note: This is copied to $fa33 [cont_fa33] and $833e above jumps here)
                ;
8356: a2 00                     LDX #$00             ; Set X = 0
8358: bd a5 fb  loc_8358        LDA dat_fba5,X       ; Loop
                                                     ;     If (dat_fba5[X] == 0) Then
835b: f0 3e                     BEQ loc_839b         ;         Continue @ [cont_fa78]   ($839b below is local addr)
                                                     ;     End If
835d: aa                        TAX                  ;     Set X = dat_fba5[X]
835e: bd a5 fd                  LDA dat_fda5,X       ; Repeat
8361: cd 5e 02                  CMP dat_025e         ;   while
8364: d0 f2                     BNE loc_8358         ;     (dat_fda5[X] != dat_025e)
8366: ad 5f 02                  LDA dat_025f         ;
8369: 0d 5c 02                  ORA dat_025c         ;     Or
836c: dd a5 fe                  CMP dat_fea5,X       ;     (dat_025f | dat_025c
836f: d0 e7                     BNE loc_8358         ;                          != dat_fea5[X])
8371: 2c 64 02                  BIT dat_0264         ; If (bit 7 of dat_0264 == 0)
8374: 10 08                     BPL loc_837e         ; Then
8376: a9 ff                     LDA #$ff             ;     Set
8378: 9d a5 fe                  STA dat_fea5,X       ;         dat_fea5[X] = $ff (255)
837b: 4c 78 fa                  JMP cont_fa78        ; Else           (Note: $fa78 is after copy, $839b is local target)
837e: 20 62 fb  loc_837e        JSR sub_fb62         ;     Call $fb62 [sub_fb62]
8381: 20 73 fb                  JSR sub_fb73         ;     Call $fb73 [sub_fb73]
8384: 20 88 fb                  JSR sub_fb88         ;     Call $fb88 [sub_fb88]
8387: 8d 6d fa                  STA smc_fa6c+1       ;     Set smc_fa6c[1] = A
838a: 8c 6e fa                  STY smc_fa6c+2       ;     Set smc_fa6c[2] = Y            (smc_fa6c[1..2] = Y * 256 + A)
838d: a0 00                     LDY #$00             ;     Set Y = 0  (128 iterations: 0..127 - copy sector bytes)
838f: b9 ff ff  loc_838f        LDA $ffff,Y          ;     Loop                 (Self-modifying code @ $fa6c [smc_fa6c])
8392: 99 00 01                  STA SioBuf,Y         ;         Set SioBuf[Y] = (*smc_fa6c[1])[Y]
8395: c8                        INY                  ;         Add 1 to Y
8396: 10 f7                     BPL loc_838f         ;     Repeat while (Y >= 0)
8398: 4c 4c fb                  JMP cont_fb4c        ;     Continue @ $fb4c [cont_fb4c]    (Note: $8398 is local target)
                                                     ; End If
                ; Note: Copied to $fa78 [cont_fa78], continuation point from $837b above
839b: 2c 5b 02  loc_839b        BIT dat_025b         ; If (bit 7 of dat_025b == 0)
839e: 30 2c                     BMI loc_83cc         ; Then
83a0: ad 03 19                  LDA FileSector_L     ;     Set
83a3: 8d 32 02                  STA DiskSector_L     ;         DiskSector_L = FileSector_L
83a6: ad 04 19                  LDA FileSector_H     ;     Set
83a9: 8d 33 02                  STA DiskSector_H     ;         DiskSector_H = FileSector_H (DiskSector_L/H = FileSector_L/H)
83ac: a9 02                     LDA #$02             ;     Set
83ae: 85 06                     STA dat_0006         ;         dat_0006 = 2  (2 retries)
83b0: 20 8e 24  loc_83b0        JSR readDiskSector   ;     Loop
                                                     ;         Call $248e [readDiskSector]
83b3: 10 07                     BPL loc_83bc         ;         If (N == 0) Then
                                                     ;             Continue @ loc_83bc     (successful)
                                                     ;         End If
83b5: c6 06                     DEC dat_0006         ;         Subtract 1 from dat_0006
83b7: d0 f7                     BNE loc_83b0         ;     Repeat while (dat_0006 != 0)    (Repeat while retries remain)
83b9: 4c 0c fb  loc_83b9        JMP cont_fb0c        ;     Continue @ [cont_fb0c]  (Note: addr is after copy, $842f below is local target)
                ; We get here if the read above was successful
83bc: a2 03     loc_83bc        LDX #$03             ;     Set X = 3 (4 iterations: 3..0)
83be: bd 00 01  loc_83be        LDA SioBuf,X         ;     Loop
                                                     ;         If (SioBuf[X] == FileId_B1[X])
83c1: dd 05 19                  CMP FileId_B1,X      ;             Continue @ [loc_83b9] -> [cont_fb0c]
83c4: d0 f3                     BNE loc_83b9         ;         End If
83c6: ca                        DEX                  ;         Subtract 1 from X
83c7: 10 f5                     BPL loc_83be         ;     Repeat while (X >= 0)
83c9: ce 5b 02                  DEC dat_025b         ;     Subtract 1 from dat_025b
                                                     ; End If
83cc: ad 60 02  loc_83cc        LDA dat_0260         ; Set
83cf: 8d 32 02                  STA DiskSector_L     ;     DiskSector_L = dat_0260
83d2: ad 61 02                  LDA dat_0261         ; Set
83d5: 8d 33 02                  STA DiskSector_H     ;     DiskSector_H = dat_0261
83d8: a9 02                     LDA #$02             ; Set
83da: 85 06                     STA dat_0006         ;     dat_0006 = 2  (2 retries)
83dc: 20 8e 24  loc_83dc        JSR readDiskSector   ; Call $248e [readDiskSector]
83df: 10 06                     BPL loc_83e7         ; If (N == 1) Then                (not successful)
83e1: c6 06                     DEC dat_0006         ;     Subtract 1 from dat_0006    (decrement retry count)
83e3: d0 f7                     BNE loc_83dc         ;     If (dat_0006 != 0) Then
                                                     ;         Continue @ [loc_83dc]   (try again if retries remaining)
                                                     ;     Else
83e5: f0 48                     BEQ loc_842f         ;         Continue @ [loc_842f]   (no more retries)
                                                     ;     End If
                                                     ; End If
83e7: ae a4 fd  loc_83e7        LDX dat_fda4         ; Set X = dat_fda4
83ea: 20 88 fb                  JSR sub_fb88         ; Call $fb88 [sub_fb88]
83ed: 8c d9 fa                  STY smc_fad7+2       ; Set smc_fad7[2] = Y
83f0: 49 80                     EOR #$80             ; Set
83f2: 8d d8 fa                  STA smc_fad7+1       ;     smc_fad7[1] = A | $80  (smc_fad7[1..2] = Y * 256 + (A | $80))
83f5: a0 00                     LDY #$00             ; Set Y = 0  (256 iterations)
83f7: b9 00 01  loc_83f7        LDA SioBuf,Y         ; Loop
83fa: 99 ff ff                  STA $ffff,Y          ;     Set (*smc_fad7[1])[Y] = SioBuf[Y]   (Note: Self-modifying code @ $fad7 [smc_fad7])
83fd: c8                        INY                  ;     Add 1 to Y
83fe: 10 f7                     BPL loc_83f7         ; Repeat while (Y >= 0)
8400: a9 fe                     LDA #$fe             ; Set
8402: 8d 01 d3                  STA PORTB            ;     PORTB = $fe          (Disable ROM)
8405: a9 40                     LDA #$40             ; Set
8407: 8d 0e d4                  STA NMIEN            ;     NMIEN = $40          (Enable VBIs, disable DLIs and RESET)
840a: 58                        CLI                  ; Set I = 0                (Enable interrupts)
840b: ae a4 fd                  LDX dat_fda4         ; Set X = dat_fda4
840e: a9 ff                     LDA #$ff             ; Set
8410: 9d a5 fe                  STA dat_fea5,X       ;     dat_fea5[X] = $ff
8413: 9d a5 fd                  STA dat_fda5,X       ; Set dat_fda5[X] = $ff
8416: ad 62 02                  LDA dat_0262_L       ; Set
8419: 8d 32 02                  STA DiskSector_L     ;     DiskSector_L = dat_0262_L
841c: ad 63 02                  LDA dat_0262_H       ; Set
841f: 8d 33 02                  STA DiskSector_H     ;     DiskSector_H = dat_0262_H
8422: a9 02                     LDA #$02             ; Set
8424: 85 06                     STA dat_0006         ;     dat_0006 = 2                   (max 2 attempts)
8426: 20 8e 24  loc_8426        JSR readDiskSector   ; Loop
                                                     ;     Call $248e [readDiskSector]
8429: 10 18                     BPL loc_8443         ;     If (N == 0) Then
                                                     ;         Continue @ [loc_8443]      (success)
                                                     ;     End If
842b: c6 06                     DEC dat_0006         ;     Subtract 1 from dat_0006       (decrement remaining attempts)
842d: d0 f7                     BNE loc_8426         ; Repeat while (dat_0006 != 0)       (try again if attempts remain)
                ; Return error
                ; Note: This is copied to $fb0c [cont_fb0c] and is a continuation point from $83b9 above
842f: ad 62 02  loc_842f        LDA dat_0262_L       ; Set
8432: 8d 32 02                  STA DiskSector_L     ;     DiskSector_L = dat_0262_L
8435: ad 63 02                  LDA dat_0262_H       ; Set
8438: 8d 33 02                  STA DiskSector_H     ;     DiskSector_H = dat_0262_H
843b: a9 00                     LDA #$00             ; Set A = 0
843d: 8d 5b 02                  STA dat_025b         ; Set dat_025b = 0
8440: a0 ff                     LDY #$ff             ; Set Y = $ff (255)                  (failure, Y = $ff, N = 1)
8442: 60                        RTS                  ; Return to caller
                ; Success
8443: ae a4 fd  loc_8443        LDX dat_fda4         ; Set X = dat_fda4
8446: ad 5f 02                  LDA dat_025f         ; Set
8449: 0d 5c 02                  ORA dat_025c         ;     dat_fea5[X]
844c: 9d a5 fe                  STA dat_fea5,X       ;        = dat_025f | dat_025c
844f: ad 5e 02                  LDA dat_025e         ; Set
8452: 9d a5 fd                  STA dat_fda5,X       ;     dat_fda5[X] = dat_025e
8455: 20 62 fb                  JSR sub_fb62         ; Call $fb62 [sub_fb62]
8458: 20 73 fb                  JSR sub_fb73         ; Call $fb73 [sub_fb73]
845b: 20 88 fb                  JSR sub_fb88         ; Call $fb88 [sub_fb88]
845e: 8d 47 fb                  STA smc_fb46+1       ; Set smc_fb46[1] = A
8461: 8c 48 fb                  STY smc_fb46+2       ; Set smc_fb46[2] = Y                (smc_fb46[1..2] = Y * 256 + A)
8464: a0 00                     LDY #$00             ; Set Y = 0  (256 iterations)
8466: b9 00 01  loc_8466        LDA SioBuf,Y         ; Loop
8469: 99 ff ff                  STA $ffff,Y          ;     Set (*smc_fb46[1])[Y] = SioBuf[Y]  (Note: Self-modifying code @ $fb46 [smc_fb46])
846c: c8                        INY                  ;     Add 1 to Y
846d: 10 f7                     BPL loc_8466         ; Repeat while (Y >= 0)

                ; Note: copied to $fb4c [cont_fb4c], continuation point from $8398 above
846f: ee 32 02                  INC DiskSector_L     ; Add 1 to DiskSector_L
8472: d0 03                     BNE loc_8477         ; If (DiskSector_L == 0) Then    (overflow)
8474: ee 33 02                  INC DiskSector_H     ;     Add 1 to DiskSector_H
                                                     ; End If
8477: a9 fe     loc_8477        LDA #$fe             ; Set
8479: 8d 01 d3                  STA PORTB            ;     PORTB = $fe          (disable ROM)
847c: a9 40                     LDA #$40             ; Set
847e: 8d 0e d4                  STA NMIEN            ;     NMIEN = $40          (Enable VBIs, disable DLIs and RESET)
8481: 58                        CLI                  ; Set I = 0                (Enable interrupts)
8482: a0 01                     LDY #$01             ; Set Y = 1                (success, Y = 1, N = 0)
8484: 60                        RTS                  ; Return to caller

                ;
                ; Copied to $fb62 [sub_fb62] (add $76dd to addrs)
                ;
                ; Input
                ;   X        -
                ;
                ; Output
                ;   Y                     = dat_fba5[X]  (original value)
                ;   dat_fba5[dat_fca5[X]] = Y            (returned value)
                ;   dat_fca5[Y]           = dat_fca5[X]  (original value)
                ;
8485: bc a5 fc                  LDY dat_fca5,X       ; Set Y = dat_fca5[X]
8488: bd a5 fb                  LDA dat_fba5,X       ; Set A = dat_fba5[X]
848b: 99 a5 fb                  STA dat_fba5,Y       ; Set dat_fba5[Y] = A
848e: a8                        TAY                  ; Set Y = A
848f: bd a5 fc                  LDA dat_fca5,X       ; Set
8492: 99 a5 fc                  STA dat_fca5,Y       ;     dat_fca5[Y] = dat_fca5[X]
8495: 60                        RTS                  ; Return to caller

                ;
                ; Copied to $fb73 [sub_fb73] (add $76dd to addrs)
                ;
                ; Input
                ;   X        -
                ;
                ; Output
                ;   Y             = dat_fba5[0]  (original value)
                ;   A             = X
                ;   dat_fba5[X]   = Y            (returned value)
                ;   dat_fba5[0]   = X
                ;   dat_fca5[X]   = dat_fca5[Y]  (original value)
                ;   dat_fca5[Y]   = X
                ;
8496: ad a5 fb                  LDA dat_fba5         ; Set A = dat_fba5
8499: 9d a5 fb                  STA dat_fba5,X       ; Set dat_fba5[X] = A
849c: 8e a5 fb                  STX dat_fba5         ; Set dat_fba5 = X
849f: a8                        TAY                  ; Set Y = A
84a0: b9 a5 fc                  LDA dat_fca5,Y       ; Set
84a3: 9d a5 fc                  STA dat_fca5,X       ;     dat_fca5[X] = dat_fca5[Y]
84a6: 8a                        TXA                  ; Set A = X
84a7: 99 a5 fc                  STA dat_fca5,Y       ; Set dat_fca5[Y] = A
84aa: 60                        RTS                  ; Return to caller

                ;
                ; - Disables NMIs
                ; - Updates the selected extended RAM bank (130XE)
                ;
                ; Copied to $fb88 [sub_fb88] (add $76dd to addrs)
                ;
                ; Input
                ;   X        -
                ;                - bits 5 & 6 mapped to bits 2 and 3 of value written to PORTB
                ;                  (bits 2 & 3 are extended RAM bank # on 130XE)
                ;   dat_025d - value is assigned to A on return
                ;
                ; Output
                ;   X        - unmodified, same as input
                ;   Y        - set to (X & $3f) | $40
                ;   A        - value of dat_025d
                ;   PORTB    - writes ((X >> 3) & $c) | $e2
                ;   NMIEN    - Set to 0 (disables Display List, Vertical Blank and RESET interrupts)
                ;
84ab: 78                        SEI                  ; Set interrupt disable flag
84ac: a0 00                     LDY #$00             ; Set
84ae: 8c 0e d4                  STY NMIEN            ;     NMIEN = 0                 (disable NMIs)
84b1: 8a                        TXA                  ; Set
84b2: 0a                        ASL                  ;     PORTB                     (Bits 5 & 6 of X are mapped to bits
84b3: 2a                        ROL                  ;       =                        2 & 3 of the result written to
84b4: 2a                        ROL                  ;         ((X >> 3) & $c) | $e2  PORTB (specifying the extended RAM
84b5: 0a                        ASL                  ;                                bank). $e2 disables ROM and
84b6: 0a                        ASL                  ;                                enables CPU access to extended
84b7: 29 0c                     AND #$0c             ;                                RAM. The expr given is a simpler
84b9: 09 e2                     ORA #$e2             ;                                equivalent with 3 right shifts
84bb: 8d 01 d3                  STA PORTB            ;                                instead of 5 left shifts)
84be: 8a                        TXA                  ; Set
84bf: 29 3f                     AND #$3f             ;     Y
84c1: 09 40                     ORA #$40             ;       =
84c3: a8                        TAY                  ;         (X & $3f) | $40    (Maps bits 0, 1, 3, 5 of X, bit 6 = 1)
84c4: ad 5d 02                  LDA dat_025d         ; Set A = dat_025d
84c7: 60                        RTS                  ; Return to caller

                ; =====================================================================
                ; Data below this point is mostly copied from D11_S518_KERNEL
                ; None of it appears to be executed, but does seem it may be used by
                ; some of the subs above.
                ; =====================================================================

                ; This is a partial copy of cont_54ee (starting @ $54f6)
84c8: 02                        .BYTE $02            ; Copied to $fba5 [dat_fba5]
84c9: 8d 83 62                  STA dat_6283
84cc: 20 35 58                  JSR equipItem
84cf: b0 03                     BCS loc_84d4
84d1: 4c 09 52                  JMP cont_5209
84d4: 4c 25 52  loc_84d4        JMP cont_5225

                ; This is an unused copy of cont_5505
                ;
84d7: a2 00                     LDX #$00
84d9: bd a2 63  loc_84d9        LDA CHR_APPAREL,X
84dc: c9 ff                     CMP #$ff
84de: f0 07                     BEQ loc_84e7
84e0: e8                        INX
84e1: e0 04                     CPX #$04
84e3: 90 f4                     BCC loc_84d9
84e5: b0 04                     BCS loc_84eb
84e7: 8a        loc_84e7        TXA
84e8: 4c 5a 55                  JMP cont_555a
84eb: a2 31     loc_84eb        LDX #$31
84ed: 8e 51 5d                  STX Sel1EquipInd
84f0: e8                        INX
84f1: 8e 67 5d                  STX Sel2EquipInd
84f4: e8                        INX
84f5: 8e 7d 5d                  STX Sel3EquipInd
84f8: e8                        INX
84f9: 8e 93 5d                  STX Sel4EquipInd
84fc: 20 2e 50                  JSR sub_502e
84ff: a9 85                     LDA #$85
8501: 8d 3a 19                  STA MenuTitleAdr_L
8504: a9 5f                     LDA #$5f
8506: 8d 3b 19                  STA MenuTitleAdr_H
8509: a9 3d                     LDA #$3d
850b: 8d 44 19                  STA MenuFootrAdr_L
850e: a9 5f                     LDA #$5f
8510: 8d 45 19                  STA MenuFootrAdr_H
8513: a2 03                     LDX #$03
8515: bd a2 63  loc_8515        LDA CHR_APPAREL,X
8518: 9d 46 19                  STA MenuItmIndices,X
851b: ca                        DEX
851c: 10 f7                     BPL loc_8515
851e: 20 8c 50                  JSR sub_508c
8521: 20 49 50  loc_8521        JSR do4SelMenu
8524: 90 06                     BCC loc_852c
8526: c9 1b                     CMP #$1b
8528: f0 10                     BEQ loc_853a
852a: d0 f5                     BNE loc_8521
852c: 18        loc_852c        CLC
852d: 69 06                     ADC #$06
852f: 8d 83 62                  STA dat_6283
8532: 20 35 58                  JSR equipItem
8535: b0 03                     BCS loc_853a
8537: 4c 09 52                  JMP cont_5209
853a: 4c 25 52  loc_853a        JMP cont_5225

                ; This is an unused copy of cont_556b
                ;
853d: ce 7f 62                  DEC dat_627f
8540: ad 98 63                  LDA CHR_STOMACH
8543: 10 03                     BPL loc_8548
8545: 4c c1 56                  JMP loc_56c1
8548: a9 04     loc_8548        LDA #$04
854a: a0 02                     LDY #$02
854c: 20 d7 56                  JSR sub_56d7
854f: a0 00                     LDY #$00
8551: b1 41                     LDA (ItemAdr_L),Y
8553: 29 78                     AND #$78
8555: f0 0a                     BEQ loc_8561
8557: a2 00                     LDX #$00
8559: dd 9e 55  loc_8559        CMP tbl_559e,X
855c: f0 09                     BEQ loc_8567
855e: ca                        DEX
855f: 10 f8                     BPL loc_8559
8561: 20 02 56  loc_8561        JSR sub_5602
8564: 4c 09 52                  JMP cont_5209
8567: bd 9f 55  loc_8567        LDA tbl_559f_H,X
856a: 48                        PHA
856b: bd a0 55                  LDA tbl_55a0_L,X
856e: 48                        PHA
856f: 60                        RTS

8570: 08                        .BYTE $08            ; This is an unused copy of tbl_559e
8571: 55                        .BYTE $55            ; This is an unused copy of tbl_559f_H
8572: a0                        .BYTE $a0            ; This is an unused copy of tbl_55a0_L

                ; This is an unused copy of cont_55a1
                ;
8573: a0 00                     LDY #$00
8575: b1 43                     LDA (ItemAttrs_L),Y
8577: aa                        TAX
8578: 09 80                     ORA #$80
857a: 85 51                     STA AttrAdjAmt
857c: 98                        TYA
857d: 9d 90 63                  STA CHR_LIT_TORCH_FLAG,X
8580: 20 b7 55                  JSR sub_55b7
8583: 20 02 56                  JSR sub_5602
8586: 4c 09 52                  JMP cont_5209

                ; This is an unused copy of sub_55b7
                ;
8589: a9 00                     LDA #$00
858b: 85 3d                     STA EffectAdr_L
858d: a9 65                     LDA #$65
858f: 85 3e                     STA EffectAdr_H
8591: a9 00                     LDA #$00
8593: 85 49                     STA dat_0049
8595: a0 00     loc_8595        LDY #$00
8597: b1 3d                     LDA (EffectAdr_L),Y
8599: 29 83                     AND #$83
859b: c5 51                     CMP AttrAdjAmt
859d: d0 03                     BNE loc_85a2
859f: 20 01 4a                  JSR sub_4a01
85a2: a5 3d     loc_85a2        LDA EffectAdr_L
85a4: 18                        CLC
85a5: 69 10                     ADC #$10
85a7: 85 3d                     STA EffectAdr_L
85a9: 90 02                     BCC loc_85ad
85ab: e6 3e                     INC EffectAdr_H
85ad: e6 49     loc_85ad        INC dat_0049
85af: a5 49                     LDA dat_0049
85b1: c9 40                     CMP #$40
85b3: 90 e0                     BCC loc_8595
85b5: a5 51                     LDA AttrAdjAmt
85b7: 29 03                     AND #$03
85b9: c9 03                     CMP #$03
85bb: d0 16                     BNE loc_85d3
85bd: aa                        TAX
85be: a9 00                     LDA #$00
85c0: 9d 90 63                  STA CHR_LIT_TORCH_FLAG,X
85c3: a2 00                     LDX #$00
85c5: a9 00     loc_85c5        LDA #$00
85c7: 9d 50 63                  STA CHR_STA_UNKNOWN,X
85ca: 8a                        TXA
85cb: 18                        CLC
85cc: 69 08                     ADC #$08
85ce: aa                        TAX
85cf: c9 38                     CMP #$38
85d1: 90 f2                     BCC loc_85c5
85d3: 60        loc_85d3        RTS

                ; This is an unused copy of sub_5602
                ;
85d4: 18                        CLC
85d5: a9 06                     LDA #$06
85d7: 65 41                     ADC ItemAdr_L
85d9: 8d 3c 19                  STA ZtsAddr1_L
85dc: 85 07                     STA SourceAdr_L
85de: a9 00                     LDA #$00
85e0: 65 42                     ADC ItemAdr_H
85e2: 8d 3d 19                  STA ZtsAddr1_H
85e5: 85 08                     STA SourceAdr_H
85e7: a0 06                     LDY #$06
85e9: b1 07                     LDA (SourceAdr_L),Y
85eb: d0 04                     BNE loc_85f1
85ed: a9 20                     LDA #$20
85ef: 91 07                     STA (SourceAdr_L),Y
85f1: a9 e8     loc_85f1        LDA #$e8
85f3: 85 16                     STA StrTmplate_L
85f5: a9 60                     LDA #$60
85f7: 85 17                     STA StrTmplate_H
85f9: ae 4a 19                  LDX dat_194a
85fc: 20 5c 3c                  JSR setStatPgStr2
85ff: a9 02                     LDA #$02
8601: 4c fc 2b                  JMP waitSeconds

                ; This is an unused copy of cont_5632
                ;
8604: a0 00                     LDY #$00
8606: b1 41                     LDA (ItemAdr_L),Y
8608: 29 78                     AND #$78
860a: f0 0a                     BEQ loc_8616
860c: a2 00                     LDX #$00
860e: dd 4f 56  loc_860e        CMP dat_564f,X
8611: f0 06                     BEQ loc_8619
8613: ca                        DEX
8614: 10 f8                     BPL loc_860e
8616: 4c 09 52  loc_8616        JMP cont_5209
8619: bd 51 56  loc_8619        LDA tbl_5650_H,X
861c: 48                        PHA
861d: bd 50 56                  LDA tbl_5650_L,X
8620: 48                        PHA
8621: ff                        .BYTE $ff
8622: 08                        .BYTE $08
8623: 52                        .BYTE $52
8624: 60                        RTS

                ; This is an unused copy of cont_5653
                ;
8625: 29 03                     AND #$03
8627: aa                        TAX
8628: bd 5f 56                  LDA tbl_565f_H,X
862b: 48                        PHA
862c: bd 63 56                  LDA tbl_5663_L,X
862f: 48                        PHA
8630: 60                        RTS

8631: 56 56 56 57               .BYTE $56,$56,$56,$57   ; This is a copy of tbl_565f_H
8635: 56 56 56 57               .BYTE $56,$56,$56,$57   ; This is a copy of tbl_5663_L

                ; This is an unused copy of useFoodPacket
                ;
8639: ad bb 63                  LDA INV_FOOD
863c: d0 03                     BNE loc_8641
863e: 4c 74 57                  JMP contYouHaveNone
8641: ce bb 63  loc_8641        DEC INV_FOOD
8644: ad 98 63                  LDA CHR_STOMACH
8647: 30 1a                     BMI loc_8663
8649: ad 99 63                  LDA CHR_HUNGER
864c: 4a                        LSR
864d: 4a                        LSR
864e: 4a                        LSR
864f: 4a                        LSR
8650: aa                        TAX
8651: bd 54 60                  LDA dat_6054,X
8654: a2 99                     LDX #$99
8656: 20 43 2e                  JSR incChrAttr8
8659: a9 1c                     LDA #$1c
865b: a2 98                     LDX #$98
865d: 20 43 2e                  JSR incChrAttr8
8660: 4c 25 52                  JMP cont_5225
8663: a9 ef     loc_8663        LDA #$ef
8665: 85 16                     STA StrTmplate_L
8667: a9 5f                     LDA #$5f
8669: 85 17                     STA StrTmplate_H
866b: ae 4a 19                  LDX dat_194a
866e: 20 5c 3c                  JSR setStatPgStr2
8671: a9 10                     LDA #$10
8673: 20 fc 2b                  JSR waitSeconds
8676: 4c 25 52                  JMP cont_5225

                ; This is an unused copy of useWaterFlask
                ;
8679: ad bc 63                  LDA INV_WATER
867c: d0 03                     BNE loc_8681
867e: 4c 74 57                  JMP contYouHaveNone
8681: ce bc 63  loc_8681        DEC INV_WATER
8684: ad 98 63                  LDA CHR_STOMACH
8687: 30 0a                     BMI loc_8693
8689: a9 10                     LDA #$10
868b: a0 08                     LDY #$08
868d: 20 d7 56                  JSR sub_56d7
8690: 4c 25 52                  JMP cont_5225
8693: a9 64     loc_8693        LDA #$64
8695: 85 16                     STA StrTmplate_L
8697: a9 60                     LDA #$60
8699: 85 17                     STA StrTmplate_H
869b: ae 4a 19                  LDX dat_194a
869e: 20 5c 3c                  JSR setStatPgStr2
86a1: a9 10                     LDA #$10
86a3: 20 fc 2b                  JSR waitSeconds
86a6: 4c 25 52                  JMP cont_5225

                ; This is an unused copy of sub_56d7
                ;
86a9: 48                        PHA
86aa: 98                        TYA
86ab: a2 98                     LDX #$98
86ad: 20 43 2e                  JSR incChrAttr8
86b0: 68                        PLA
86b1: a2 9a                     LDX #$9a
86b3: 4c 43 2e                  JMP incChrAttr8

                ; This is an unused copy of cont_56e4
                ;
86b6: 20 dc 57  loc_86b6        JSR sub_57dc
86b9: 4c 25 52                  JMP cont_5225

                ; This is an unused copy of useUnlitTorch
                ;
86bc: ad bd 63                  LDA INV_TORCHES
86bf: d0 06                     BNE loc_86c7
86c1: 4c 74 57                  JMP contYouHaveNone
86c4: 4c 25 52  loc_86c4        JMP cont_5225
86c7: 20 ab 57  loc_86c7        JSR doAssignHand
86ca: b0 f8                     BCS loc_86c4
86cc: a2 61                     LDX #$61
86ce: a0 29                     LDY #$29
86d0: 20 4d 4b                  JSR addItem
86d3: 30 e1                     BMI loc_86b6
86d5: a9 88                     LDA #$88
86d7: 20 b0 49                  JSR sub_49b0
86da: 30 da                     BMI loc_86b6
86dc: a0 02                     LDY #$02
86de: b9 1a 61  loc_86de        LDA EffLitTorch-2,Y
86e1: 91 3d                     STA (EffectAdr_L),Y
86e3: c8                        INY
86e4: c0 0f                     CPY #$0f
86e6: d0 f6                     BNE loc_86de
86e8: a5 4b                     LDA ItemIndex
86ea: 91 3d                     STA (EffectAdr_L),Y
86ec: ce bd 63                  DEC INV_TORCHES
86ef: ee 90 63                  INC CHR_LIT_TORCH_FLAG
86f2: 4c af 54                  JMP cont_54af

                ; This is an unused copy of useTimepiece
                ;
86f5: ad c1 63                  LDA INV_TIMEPIECES
86f8: f0 4c                     BEQ loc_8746
86fa: a9 61                     LDA #$61
86fc: 85 16                     STA StrTmplate_L
86fe: a9 61                     LDA #$61
8700: 85 17                     STA StrTmplate_H
8702: 20 31 2e                  JSR sub_2e31
8705: a9 73                     LDA #$73
8707: ae 09 63                  LDX TME_MINUTES
870a: e0 01                     CPX #$01
870c: d0 02                     BNE loc_8710
870e: a9 20                     LDA #$20
8710: 8d 76 61  loc_8710        STA MinutePlural
8713: a9 01                     LDA #$01
8715: e0 0a                     CPX #$0a
8717: 90 02                     BCC loc_871b
8719: a9 02                     LDA #$02
871b: 8d 6e 61  loc_871b        STA NumMinuteChars
871e: ad 0a 63                  LDA TME_HOURS
8721: a0 01                     LDY #$01
8723: c9 0a                     CMP #$0a
8725: 90 02                     BCC loc_8729
8727: a0 02                     LDY #$02
8729: 8c 86 61  loc_8729        STY NumHourChars
872c: 0a                        ASL
872d: aa                        TAX
872e: bd 91 61                  LDA HourToSuffix,X
8731: 8d 87 61                  STA HourSuffix
8734: bd 92 61                  LDA HourToSuffix+1,X
8737: 8d 88 61                  STA HourSuffix+1
873a: ae 4a 19  loc_873a        LDX dat_194a
873d: 20 5c 3c                  JSR setStatPgStr2
8740: 20 fa 2b                  JSR waitSixSeconds
8743: 4c 25 52                  JMP cont_5225
                ; This is an unused copy of contYouHaveNone
8746: a9 4d     loc_8746        LDA #$4d
8748: 85 16                     STA StrTmplate_L
874a: a9 61                     LDA #$61
874c: 85 17                     STA StrTmplate_H
874e: d0 ea                     BNE loc_873a

                ; This is an unused copy of doCastMenu
                ;
8750: a9 00                     LDA #$00
8752: 8d 76 62                  STA dat_6276
8755: a9 d0                     LDA #$d0
8757: 8d b0 51                  STA smc_51b0
875a: a9 2e                     LDA #$2e
875c: 8d 3a 19                  STA MenuTitleAdr_L
875f: a9 5f                     LDA #$5f
8761: 8d 3b 19                  STA MenuTitleAdr_H
8764: 4c d8 51                  JMP cont_51d8

                ; This is an unused copy of sub_5795
                ;
8767: c9 80                     CMP #$80
8769: b0 11                     BCS loc_877c
876b: a8                        TAY
876c: b9 4b 64                  LDA InvItemAdr_H,Y
876f: 85 0a                     STA dat_0009_H
8771: b9 0b 64                  LDA InvItemAdr_L,Y
8774: 85 09                     STA dat_0009_L
8776: a0 02                     LDY #$02
8778: a9 08                     LDA #$08
877a: 91 09                     STA (dat_0009_L),Y
877c: 60        loc_877c        RTS

                ; This is an unused copy of doAssignHand
                ;
877d: a9 96     loc_877d        LDA #$96
877f: 85 16                     STA StrTmplate_L
8781: a9 5f                     LDA #$5f
8783: 85 17                     STA StrTmplate_H
8785: ae 4a 19                  LDX dat_194a
8788: 20 5c 3c                  JSR setStatPgStr2
878b: a9 c6     loc_878b        LDA #$c6
878d: 8d 77 19                  STA cont_addr_1977_L
8790: a9 57                     LDA #$57
8792: 8d 78 19                  STA cont_addr_1977_H
8795: 4c f3 2f                  JMP sub_2ff3
8798: a5 31                     LDA KbdChar
879a: 30 ef                     BMI loc_878b
879c: c9 1b                     CMP #$1b
879e: f0 0d                     BEQ loc_87ad
87a0: 38                        SEC
87a1: e9 31                     SBC #$31
87a3: 90 d8                     BCC loc_877d
87a5: c9 02                     CMP #$02
87a7: b0 d4                     BCS loc_877d
87a9: 8d 83 62                  STA dat_6283
87ac: 18                        CLC
87ad: 60        loc_87ad        RTS

                ; This is an unused copy of sub_57dc
                ;
87ae: a9 c1                     LDA #$c1
87b0: 85 16                     STA StrTmplate_L
87b2: a9 61                     LDA #$61
87b4: 85 17                     STA StrTmplate_H
87b6: ae 4a 19                  LDX dat_194a
87b9: 20 5c 3c                  JSR setStatPgStr2
87bc: 4c fa 2b                  JMP waitSixSeconds

                ; This is an unused copy of cont_57ed
                ;
87bf: ae 15 63                  LDX CHR_LOC_MAP
87c2: ad 13 63                  LDA CHR_LOC_X
87c5: 18                        CLC
87c6: 7d 8b 62                  ADC MapNum2XOfs,X
87c9: 8d 89 62                  STA dat_6289
87cc: 38                        SEC
87cd: bd 92 62                  LDA MapNum2YBase,X
87d0: ed 14 63                  SBC CHR_LOC_Y
87d3: 8d 8a 62                  STA dat_628a
87d6: 10 05                     BPL loc_87dd
87d8: a9 ff                     LDA #$ff
87da: 8d 89 62                  STA dat_6289
87dd: a9 99     loc_87dd        LDA #$99
87df: 85 16                     STA StrTmplate_L
87e1: a9 62                     LDA #$62
87e3: 85 17                     STA StrTmplate_H
87e5: ae 4a 19                  LDX dat_194a
87e8: ce fe 18                  DEC dat_18fe
87eb: 20 5c 3c                  JSR setStatPgStr2
87ee: a9 00                     LDA #$00
87f0: 8d fe 18                  STA dat_18fe
87f3: 20 b0 2b                  JSR pressAnyKey
87f6: a9 07                     LDA #$07
87f8: 85 16                     STA StrTmplate_L
87fa: a9 20                     LDA #$20
87fc: 85 17                     STA StrTmplate_H
87fe: ae 4a 19                  LDX dat_194a
8801: 20 5c 3c                  JSR setStatPgStr2
8804: 4c 09 52                  JMP cont_5209

                ; This is an unused copy of equipItem
                ;
8807: ae 83 62                  LDX dat_6283
880a: bd 9c 63                  LDA CHR_PRI_WEAPON,X
880d: 30 07                     BMI loc_8816
880f: c5 4b                     CMP ItemIndex
8811: f0 03                     BEQ loc_8816
8813: 20 95 57                  JSR sub_5795
8816: a5 4b     loc_8816        LDA ItemIndex
8818: 20 b4 4e                  JSR sub_4eb4
881b: 08                        PHP
881c: 20 a2 4e                  JSR sub_4ea2
881f: a5 4b                     LDA ItemIndex
8821: ae 83 62                  LDX dat_6283
8824: 9d 9c 63                  STA CHR_PRI_WEAPON,X
8827: 28                        PLP
8828: 60                        RTS

                ; This is an unused copy of sub_5857
                ;
8829: a2 00                     LDX #$00
882b: 8e 7b 19                  STX dat_197b
882e: ca                        DEX
882f: 8e c1 58                  STX dat_58c1
8832: a9 0f                     LDA #$0f
8834: 8d 84 62                  STA dat_6284
8837: ae 84 62  loc_8837        LDX dat_6284
883a: bd 94 64                  LDA dat_6494,X
883d: c9 02                     CMP #$02
883f: d0 36                     BNE loc_8877
8841: bd c4 64                  LDA dat_64c4,X
8844: cd 15 63                  CMP CHR_LOC_MAP
8847: d0 2e                     BNE loc_8877
8849: bd a4 64                  LDA dat_64a4,X
884c: cd 13 63                  CMP CHR_LOC_X
884f: d0 26                     BNE loc_8877
8851: bd b4 64                  LDA dat_64b4,X
8854: cd 14 63                  CMP CHR_LOC_Y
8857: d0 1e                     BNE loc_8877
8859: 24 4b                     BIT ItemIndex
885b: 10 0a                     BPL loc_8867
885d: a9 53                     LDA #$53
885f: 8d c1 59                  STA dat_59c1_L
8862: a9 5e                     LDA #$5e
8864: 8d c2 59                  STA dat_59c1_H
8867: ae 84 62  loc_8867        LDX dat_6284
886a: bd d4 64                  LDA dat_64d4,X
886d: 85 4b                     STA ItemIndex
886f: 8d c1 58                  STA dat_58c1
8872: 20 c2 58                  JSR sub_58c2
8875: b0 1b                     BCS loc_8892
8877: ce 84 62  loc_8877        DEC dat_6284
887a: 10 bb                     BPL loc_8837
887c: ad c1 58                  LDA dat_58c1
887f: 10 11                     BPL loc_8892
8881: a9 ee                     LDA #$ee
8883: 85 16                     STA StrTmplate_L
8885: a9 59                     LDA #$59
8887: 85 17                     STA StrTmplate_H
8889: ae 4a 19                  LDX dat_194a
888c: 20 5c 3c                  JSR setStatPgStr2
888f: 20 b0 2b                  JSR pressAnyKey
8892: 60        loc_8892        RTS

8893: 00                        .BYTE $00            ; This is a copy of dat_58c1

                ; This is an unused copy of sub_58c2
                ;
8894: a5 4b                     LDA ItemIndex
8896: 20 74 4b                  JSR setItemAdr
8899: a9 06                     LDA #$06
889b: 18                        CLC
889c: 65 41                     ADC ItemAdr_L
889e: 8d c1 59                  STA dat_59c1_L
88a1: a5 42                     LDA ItemAdr_H
88a3: 69 00                     ADC #$00
88a5: 8d c2 59                  STA dat_59c1_H
88a8: a9 9b                     LDA #$9b
88aa: 8d 55 59                  STA addr_5955_L
88ad: a9 59                     LDA #$59
88af: 8d 56 59                  STA addr_5955_H
88b2: a0 00                     LDY #$00
88b4: b1 41                     LDA (ItemAdr_L),Y
88b6: 29 7f                     AND #$7f
88b8: d0 1c                     BNE loc_88d6
88ba: a5 4b                     LDA ItemIndex
88bc: 20 c4 4e                  JSR getItemAttrs
88bf: a0 01                     LDY #$01
88c1: b1 43                     LDA (ItemAttrs_L),Y
88c3: 8d e3 59                  STA GetNum_H
88c6: c8                        INY
88c7: b1 00                     LDA (dat_0000),Y     ; Note: The addr here differs from the kernel copy (00 vs 43)
88c9: 8d e4 59                  STA GetNum_L
88cc: a9 ab                     LDA #$ab
88ce: 8d 55 59                  STA addr_5955_L
88d1: a9 59                     LDA #$59
88d3: 8d 56 59                  STA addr_5955_H
88d6: ad 55 59  loc_88d6        LDA addr_5955_L
88d9: 85 16                     STA StrTmplate_L
88db: ad 56 59                  LDA addr_5955_H
88de: 85 17                     STA StrTmplate_H
88e0: ae 4a 19                  LDX dat_194a
88e3: 20 5c 3c                  JSR setStatPgStr2
88e6: a9 21     loc_88e6        LDA #$21
88e8: 8d 77 19                  STA cont_addr_1977_L
88eb: a9 59                     LDA #$59
88ed: 8d 78 19                  STA cont_addr_1977_H
88f0: 4c f3 2f                  JMP sub_2ff3
88f3: a5 31                     LDA KbdChar
88f5: 30 ef                     BMI loc_88e6
88f7: c9 1b                     CMP #$1b
88f9: f0 24                     BEQ loc_891f
88fb: 20 a5 2b                  JSR charToUpper
88fe: c9 4e                     CMP #$4e
8900: f0 1b                     BEQ loc_891d
8902: c9 59                     CMP #$59
8904: d0 d0                     BNE loc_88d6
8906: a9 08                     LDA #$08
8908: 8d 61 19                  STA dat_1961
890b: a0 00                     LDY #$00
890d: b1 41                     LDA (ItemAdr_L),Y
890f: d0 06                     BNE loc_8917
8911: 20 57 59                  JSR sub_5957
8914: 4c 4b 59                  JMP cont_594b
8917: a0 02     loc_8917        LDY #$02
8919: a9 01                     LDA #$01
891b: 91 41                     STA (ItemAdr_L),Y

                ; Is this a copy of code from some other module?
891d: ac f9 ac  loc_891d        LDY $acf9               ; Note: differs from the kernel copy
8920: f9 c9 f9                  SBC irq_VIMIRQ_f9c9,Y   ; Note: differs from the kernel copy

                ; ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                ; The preceeding $700 (1792) bytes are copied to $f900 by sub_819e
                ; ----------------------------------------------------------------

8923: 29 38                     AND #$38             ; Note: differs from the kernel copy
8925: 60                        RTS

                ; This is an unused copy of code starting at $2926 [loc_2926]
                ;
8926: 20 2b 29                  JSR sub_292b
8929: 18                        CLC
892a: 60                        RTS

                ; This is an unused copy of sub_292b
                ;
892b: a9 07                     LDA #$07
892d: 85 16                     STA StrTmplate_L
892f: a9 20                     LDA #$20
8931: 85 17                     STA StrTmplate_H
8933: 20 88 1c                  JSR printBtm
8936: 60                        RTS

                ; This is an unused copy of sub_2937
                ;
8937: ad 0b 19                  LDA FileDestAdr_L
893a: 85 09                     STA dat_0009_L
893c: ad 0c 19                  LDA FileDestAdr_H
893f: 85 0a                     STA dat_0009_H
8941: ad 03 19                  LDA FileSector_L
8944: 8d 32 02                  STA DiskSector_L
8947: ad 04 19                  LDA FileSector_H
894a: 8d 33 02                  STA DiskSector_H
894d: ad 07 19                  LDA FileLen_L
8950: 85 0b                     STA dat_000b
8952: ad 08 19                  LDA FileLen_H
8955: 85 0c                     STA dat_000c
8957: 20 79 29                  JSR sub_2979
895a: 30 1a                     BMI loc_8976
895c: a2 0f                     LDX #$0f
895e: bd 00 01  loc_895e        LDA SioBuf,X
8961: 9d 80 01                  STA DecryptKeyBuf,X
8964: ca                        DEX
8965: 10 f7                     BPL loc_895e
8967: a2 03                     LDX #$03
8969: bd 05 19  loc_8969        LDA FileId_B1,X
896c: dd 80 01                  CMP DecryptKeyBuf,X
896f: d0 05                     BNE loc_8976
8971: ca                        DEX
8972: 10 f5                     BPL loc_8969
8974: e8                        INX
8975: 60                        RTS
8976: a9 ff     loc_8976        LDA #$ff
8978: 60                        RTS

                ; This is an unused copy of sub_2979
                ;
8979: 2c 58 02                  BIT SysMemorySize
897c: 50 08                     BVC loc_8986
897e: 2c 5a 02                  BIT dat_025a
8981: 10 03                     BPL loc_8986
8983: 4c f4 f9                  JMP sub_f9f4
8986: a9 02     loc_8986        LDA #$02
8988: 85 06                     STA dat_0006
898a: 20 8e 24  loc_898a        JSR readDiskSector
898d: 10 06                     BPL loc_8995
898f: c6 06                     DEC dat_0006
8991: d0 f7                     BNE loc_898a
8993: f0 08                     BEQ loc_899d
8995: ee 32 02  loc_8995        INC DiskSector_L
8998: d0 03                     BNE loc_899d
899a: ee 33 02                  INC DiskSector_H
899d: 98        loc_899d        TYA
899e: 60                        RTS

                ; The following is a partial copy of StrPleaseInsert
899f: a8 a6 00  dat_899f        .BYTE $a8,$a6,$00                      ; "..."
89a2: 01 a5 50 6c 65 61 73 65   .BYTE $01,$a5,$50,$6c,$65,$61,$73,$65  ; "..Please"
89aa: 20 69 6e 73 65 72 74 20   .BYTE $20,$69,$6e,$73,$65,$72,$74,$20  ; " insert "
89b2: 54 68 65 20 44 75 6e 67   .BYTE $54,$68,$65,$20,$44,$75,$6e,$67  ; "The Dung"
89ba: 65 6f 6e 20 44 69 73 6b   .BYTE $65,$6f,$6e,$20,$44,$69,$73,$6b  ; "eon Disk"
89c2: 20 b2 11 19 01 0d 0d a5   .BYTE $20,$b2,$11,$19,$01,$0d,$0d,$a5  ; " ......."
89ca: 53 69 64 65 20 b2 10 19   .BYTE $53,$69,$64,$65,$20,$b2,$10,$19  ; "Side ..."
89d2: 01 20 69 6e 74 6f 20 61   .BYTE $01,$20,$69,$6e,$74,$6f,$20,$61  ; ". into a"
89da: 6e 79 20 64 72 69 76 65   .BYTE $6e,$79,$20,$64,$72,$69,$76,$65  ; "ny drive"
89e2: 2e 0d a6 00 05 a5 50 72   .BYTE $2e,$0d,$a6,$00,$05,$a5,$50,$72  ; "......Pr"
89ea: 65 73 73 20 a1 53 50 41   .BYTE $65,$73,$73,$20,$a1,$53,$50,$41  ; "ess .SPA"
89f2: 43 45 20 42 41 52 a0 20   .BYTE $43,$45,$20,$42,$41,$52,$a0,$20  ; "CE BAR. "
89fa: 74 6f 20 63 6f 6e         .BYTE $74,$6f,$20,$63,$6f,$6e          ; "to con"
