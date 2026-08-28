
                ; 0000 L0080 @0600 [exe]
                * = $0600

                ; Boot sector header
0600: 01        BFLAG           .BYTE $01         ; Boot flags (stored at $0240 DFLAGS)
0601: 01        BRCNT           .BYTE $01         ; Load one sector
0602: 00 06     BLDADR          .BYTE $00,$06     ; Load sector to $0600
0604: 06 06     BIWTARR         .BYTE $06,$06     ; Init vector to start execution is $606 (bootDungeon)

                ; Boot sector code
0606: a9 00     bootDungeon     LDA #$00          ; Turn off ANTIC
0608: 8d 2f 02                  STA SDMCTL        ;     processing (blank screen)
060b: a5 14                     LDA RTCLOK+2      ; Wait for
060d: c5 14     loc_060d        CMP RTCLOK+2      ;     next
060f: f0 fc                     BEQ loc_060d      ;     vblank
0611: ad 01 d3                  LDA PORTB         ; Set PORTB
0614: 09 02                     ORA #$02          ;       =
0616: 8d 01 d3                  STA PORTB         ;         PORTB | 2                (Disable BASIC ROM on XL/130XE)
0619: a9 10                     LDA #$10          ; Set
061b: 8d 0a 03                  STA DAUX1         ;     DAUX1 = $10 (16)             (sector 16 - Game intro sequence)
061e: a9 00                     LDA #$00          ;
0620: 8d c6 02                  STA COLOR2        ; Set COLOR2 = 0                   (background color to black)
0623: 85 41                     STA SOUNDR        ; Set SOUNDR = 0                   (Turn off disk I/O beep)
0625: 8d 04 03                  STA DBUFLO        ; Set DBUFLO/HI
0628: a9 bc                     LDA #$bc          ;       =
062a: 8d 05 03                  STA DBUFHI        ;         $bc00 [TODO: label]
062d: ad 1f d0                  LDA CONSOL        ; If (CONSOL == 3)
0630: c9 03                     CMP #$03          ; Then                             (Option console key pressed)
0632: f0 08                     BEQ loc_063c      ;     Continue @ $063c [loc_063c]  (skip intro sequence)
                                                  ; End If

                ; Normal boot, load intro sequence
                ; This appears to be different than the original disks
                ; which seem to have loaded to $b000 instead of $bc00
0634: 20 53 e4  loc_0634        JSR DSKINV        ; Read sector into buffer
0637: 30 fb                     BMI loc_0634      ; If error, try again
0639: 4c 00 bc                  JMP introSequence ; Jump to code loaded at $bc00 [introSequence]

                ; Option key was pressed, skipped intro
                ; Load second sector of secondary boot code to $0680
063c: ce 0a 03  loc_063c        DEC DAUX1         ; Subtract 1 from DAUX1            (sector to load = $0f (15))
063f: a9 80                     LDA #$80          ; Set
0641: a0 06                     LDY #$06          ;     DBUFLO/HI
0643: 8d 04 03                  STA DBUFLO        ;        =
0646: 8c 05 03                  STY DBUFHI        ;           $0680
0649: 20 53 e4  loc_0649        JSR DSKINV        ; Read sector into buffer
064c: 30 fb                     BMI loc_0649      ; If error, try again

                ; Load first sector of secondary boot code to $0600 (replacing this code)
                ; And transfer execution to it
064e: ce 0a 03                  DEC DAUX1         ; Subtract 1 from DAUX1            (sector to load = $0e (14))
0651: a9 00                     LDA #$00          ; Update dest buffer
0653: 8d 04 03                  STA DBUFLO        ;     address to $0600
0656: a9 05                     LDA #$05          ; Push return
0658: 48                        PHA               ;     address $05ff
0659: a9 ff                     LDA #$ff          ;     to stack
065b: 48                        PHA               ;     (e.g. PC = $0600 on return to execute loaded code)
065c: 4c 53 e4                  JMP DSKINV        ; Read sector and return to $0600  (note JMP instead of JSR)

                ; Unused data
065f: 9b 54 68  UnusedBytes    .BYTE $9b,$54,$68                      ; ".Th"
0667: 65 20 48 65 69 73 74 20  .BYTE $65,$20,$48,$65,$69,$73,$74,$20  ; "e Heist "
066f: 4e 65 74 77 6f 72 6b 21  .BYTE $4e,$65,$74,$77,$6f,$72,$6b,$21  ; "Network!"
0677: 9b 9b 9b 9b 9b 9b 9b 9b  .BYTE $9b,$9b,$9b,$9b,$9b,$9b,$9b,$9b  ; "........"
067f: 9b 9b 9b 9b 9b 9b        .BYTE $9b,$9b,$9b,$9b,$9b,$9b          ; "......"