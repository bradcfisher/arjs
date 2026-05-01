
; 0000 L0080 @0600 [exe]
* = $0600

; Boot sector header
0600: 01        BFLAG           .BYTE $01         ; Boot flags (stored at $240 DFLAGS)
0601: 01        BRCNT           .BYTE $01         ; Load one sector
0602: 00 06     BLDADR          .BYTE $00,$06     ; Load sector to $600
0604: 06 06     BIWTARR         .BYTE $06,$06     ; Init vector to start execution is $606 (BOOT_DUNGEON)

; Boot sector code
0606: a9 00     BOOT_DUNGEON    LDA #$00          ; Turn off ANTIC
0608: 8d 2f 02                  STA SDMCTL        ;     processing (blank screen)
060b: a5 14                     LDA RTCLOK+2      ; Wait for
060d: c5 14     loc_060d        CMP RTCLOK+2      ;     next
060f: f0 fc                     BEQ loc_060d      ;     vblank
0611: ad 01 d3                  LDA PORTB         ; ???
0614: 09 02                     ORA #$02          ; ???
0616: 8d 01 d3                  STA PORTB         ; ???
0619: a9 10                     LDA #$10          ; Set read sector
061b: 8d 0a 03                  STA DAUX1         ;     to $10 (16) - Game intro sequence
061e: a9 00                     LDA #$00          ;
0620: 8d c6 02                  STA COLOR2        ; Set background color to 0
0623: 85 41                     STA SOUNDR        ; Turn off disk I/O beep
0625: 8d 04 03                  STA DBUFLO        ; Set dest buffer
0628: a9 bc                     LDA #$bc          ;     address
062a: 8d 05 03                  STA DBUFHI        ;     to $BC00
062d: ad 1f d0                  LDA CONSOL        ; Read console button state
0630: c9 03                     CMP #$03          ; If Option key is pressed
0632: f0 08                     BEQ loc_063c      ;     skip intro sequence

; Normal boot, load intro sequence
; This appears to be different than the original disks
; which seem to have loaded to $B000 instead of $BC00
0634: 20 53 e4  loc_0634        JSR DSKINV        ; Read sector into buffer
0637: 30 fb                     BMI loc_0634      ; If error, try again
0639: 4c 00 bc                  JMP $bc00         ; Jump to code loaded at $BC00

; Option key was pressed, skipped intro
; Load second sector of code to $680
063c: ce 0a 03  loc_063c        DEC DAUX1         ; Subtract one from sector to load ($F (15))
063f: a9 80                     LDA #$80          ; Update dest
0641: a0 06                     LDY #$06          ;     buffer
0643: 8d 04 03                  STA DBUFLO        ;     address
0646: 8c 05 03                  STY DBUFHI        ;     to $680 (Display buffer?)
0649: 20 53 e4  loc_0649        JSR DSKINV        ; Read sector into buffer
064c: 30 fb                     BMI loc_0649      ; If error, try again

; Load first sector of code to $600 (over this code)
; And transfer execution to it
064e: ce 0a 03                  DEC DAUX1         ; Subtract one from sector to load ($E (14))
0651: a9 00                     LDA #$00          ; Update dest buffer
0653: 8d 04 03                  STA DBUFLO        ;     address to $600
0656: a9 05                     LDA #$05          ; Push return
0658: 48                        PHA               ;     address $05ff
0659: a9 ff                     LDA #$ff          ;     to stack
065b: 48                        PHA               ;     (e.g. PC = $600 on return to execute loaded code)
065c: 4c 53 e4                  JMP DSKINV        ; Read sector into buffer (note JMP instead of JSR)

; Unused data
065f: 9b 54 68 65 20 48 65 69  UNUSED_BYTES  .BYTE $9b,$54,$68,$65,$20,$48,$65,$69  ; .The Hei
0667: 73 74 20 4e 65 74 77 6f   .BYTE $73,$74,$20,$4e,$65,$74,$77,$6f  ; st Netwo
066f: 72 6b 21 9b 9b 9b 9b 9b   .BYTE $72,$6b,$21,$9b,$9b,$9b,$9b,$9b  ; rk!.....
0677: 9b 9b 9b 9b 9b 9b 9b 9b   .BYTE $9b,$9b,$9b,$9b,$9b,$9b,$9b,$9b  ; ........
067f: 9b                        .BYTE $9b         ; .