
                ; 0000 L0100 @0600 [exe]
                * = $0600

                ; Loads and decrypts the main game kernel
                ;
                ; Input
                ;   DDEVIC - expected to be $31 ('1')
                ;
0600: a9 52     loadKernel      LDA #$52            ; Set
0602: 8d 02 03                  STA DCOMND          ;     DCOMND = $52 ('R')           (read disk sector)
                ; Load game kernel key sector @ $100 (stack page)
0605: a9 00                     LDA #$00            ; Set
0607: 8d 04 03                  STA DBUFLO          ;     DBUFLO/HI
060a: a9 01                     LDA #$01            ;        =
060c: 8d 05 03                  STA DBUFHI          ;          $0100 [KeySectorBuf]    (read into $100 to $17f)
060f: a9 05                     LDA #$05            ; Set
0611: 8d 0a 03                  STA DAUX1           ;     DAUX1/2                      (set sector to read)
0614: a9 02                     LDA #$02            ;        =
0616: 8d 0b 03                  STA DAUX2           ;          $0205                   (Sector 517: Kernel key sector)
0619: 20 53 e4                  JSR DSKINV          ; Call $e453 [DSKINV]              (Read sector from disk)
                ; Load game kernel @ $1400 [GameKernel]
061c: ee 0a 03                  INC DAUX1           ; Select next sector $0206 (518)
061f: a9 00                     LDA #$00            ; Set
0621: 8d 04 03                  STA DBUFLO          ;     DBUFLO/HI
0624: a9 14                     LDA #$14            ;        =
0626: 8d 05 03                  STA DBUFHI          ;          $1400 [GameKernel]      (read into $1400 to $62ff)
0629: a9 9e                     LDA #$9e            ; Set
062b: 85 80                     STA NumSectors      ;     NumSectors = $9e (158)       (158 * 128 = $4f00 / 20224 bytes)
062d: 20 4e 06                  JSR readSectors     ; Call $064e [readSectors]         (Read sectors to $1400)
                ; Load kernel loader @ $8000 [KernelLoader]
0630: a9 cd                     LDA #$cd            ; Set
0632: 8d 0a 03                  STA DAUX1           ;     DAUX1/2
0635: a9 00                     LDA #$00            ;        =
0637: 8d 0b 03                  STA DAUX2           ;          $00cd (205)             (Sector 205: Kernel Loader)
063a: a9 00                     LDA #$00            ; Set
063c: 8d 04 03                  STA DBUFLO          ;     DBUFLO/HI
063f: a9 80                     LDA #$80            ;        =
0641: 8d 05 03                  STA DBUFHI          ;          $8000 [KernelLoader]    (read into $8000 to $89ff)
0644: a9 14                     LDA #$14            ; Set
0646: 85 80                     STA NumSectors      ;     NumSectors = $14 (20)        (20 * 128 = $A00 / 2560 bytes)
0648: 20 4e 06                  JSR readSectors     ; Call $064e [readSectors]         (Read sectors to $8000)
064b: 4c 6f 06                  JMP prepareKey      ; Call $066f [prepareKey]          (Prep descryption key for use)

                ; Reads multiple sectors from disk
                ;
                ; Input
                ;   DCOMND     - Expected to be $52 ('R' - read disk sector)
                ;   DBUFLO/HI  - Destination address of buffer to write bytes to.
                ;   DAUX1/2    - Starting disk sector to read
                ;   NumSectors - Number of sectors to read
                ;
064e: 20 53 e4  readSectors     JSR DSKINV          ; Loop
                                                    ;     Call $e453 [DSKINV]          (read sector to the dest buffer)
0651: ee 0a 03                  INC DAUX1           ;     Add 1 to DAUX1               (select next sector)
0654: d0 03                     BNE loc_0659        ;     If (DAUX1 == 0) Then         (overflow - 16 bit add)
0656: ee 0b 03                  INC DAUX2           ;         Add 1 to DAUX2
                                                    ;     End If
0659: ad 04 03  loc_0659        LDA DBUFLO          ;     Set
065c: 18                        CLC                 ;         DBUFLO
065d: 69 80                     ADC #$80            ;            =                     (move buf forward size of sector)
065f: 8d 04 03                  STA DBUFLO          ;              DBUFLO + $80 (128)  (C = 1 on overflow else 0)
0662: ad 05 03                  LDA DBUFHI          ;     Set
0665: 69 00                     ADC #$00            ;         DBUFHI
0667: 8d 05 03                  STA DBUFHI          ;            = DBUFHI + C          (carry overflow - 16 bit add)
066a: c6 80                     DEC NumSectors      ;     Subtract 1 from NumSectors
066c: d0 e0                     BNE readSectors     ; Repeat while (NumSectors == 0)
066e: 60                        RTS                 ; Return to caller

                ; Decrypt the game kernel
                ; ------------------------

                ; Prepare the decryption key
                ; Repeats first 16 bytes over the entire 128 byte key sector data.
                ;
                ; Input
                ;   KeySectorBuf[0..$7f] - Initial 16 bytes hold key
                ;   GameKernel[0..$4f00]  - Encrypted game kernel
                ;
                ; Output
                ;   KeySectorBuf[0..$7f] - Initial 16 bytes repeated to fill entire key
                ;
066f: a0 00     prepareKey      LDY #$00            ; Y = 0     (Key sector index: 0..127)
0671: a2 00     loc_0671        LDX #$00            ; Loop
                                                    ;     X = 0     (Encryption key byte index: 0..15)
0673: bd 00 01  loc_0673        LDA KeySectorBuf,X  ;     Loop
                                                    ;         Set
0676: 99 00 01                  STA KeySectorBuf,Y  ;             KeySectorBuf[Y] = KeySectorBuf[X]
0679: c8                        INY                 ;         Add 1 to Y
067a: 30 07                     BMI decryptKernel   ;         If (Y >= $80) Then
                                                    ;             Exit Both Loops       (reached end of 128 byte sector)
                                                    ;         End If
067c: e8                        INX                 ;         Add 1 to X
067d: e0 10                     CPX #$10            ;     Repeat
067f: 90 f2                     BCC loc_0673        ;        while (X < 16)
0681: b0 ee                     BCS loc_0671        ; Repeat while (true)         (reset key index back to 0 & continue)
                ;
                ; Decrypts the game kernel bytes and continues @ $807e [kernelEntry]
                ;
                ; Input
                ;   KeySectorBuf[0..$7f] - Holds decryption key bytes
                ;   GameKernel[0..$4f00]  - Encrypted game kernel
                ;
                ; Output
                ;   GameKernel[0..$4f00]  - Unencrypted game kernel
                ;
0683: a0 00     decryptKernel   LDY #$00            ; Set Y = 0 (current byte index)
0685: 84 86                     STY dat_0086        ; Set dat_0086 = 0                    (unused?)
0687: 84 87                     STY dat_0087        ; Set dat_0087 = 0                    (unused?)
0689: 84 82                     STY DecryptAddr     ; Set DecryptAddr[0..1]
068b: a9 14                     LDA #$14            ;        =
068d: 85 83                     STA DecryptAddr_H   ;          $1400 [GameKernel]
068f: a9 4f                     LDA #$4f            ; Set
0691: 85 85                     STA DecryptPages    ;     DecryptPages = $4f (79)         (79 * 255 = 20224 bytes)
0693: a2 00                     LDX #$00            ; X = 0  (Encryption key byte index)
0695: b1 82     decryptPage     LDA (DecryptAddr),Y ; Loop
                                                    ;     Set
0697: 4a                        LSR                 ;         A = (*DecryptAddr)[Y] >> 1  (C = old bit 0 of A)
0698: 90 02                     BCC loc_069c        ;     If (C == 1) Then                (byte is odd/bit 0 set)
069a: 09 80                     ORA #$80            ;         Set A = A | $80             (e.g. rotate A right 1 bit)
                                                    ;     End If
069c: 5d 00 01  loc_069c        EOR KeySectorBuf,X  ;     Set                             (XOR with encryption key byte)
069f: 91 82                     STA (DecryptAddr),Y ;         (DecryptAddr)[Y] = A ^ KeySectorBuf[X]
06a1: e8                        INX                 ;     Add 1 to X
06a2: 10 02                     BPL loc_06a6        ;     If (bit 7 of X == 1) Then
06a4: a2 00                     LDX #$00            ;         Set X = 0                   (Reset key offset back to 0)
                                                    ;     End If
06a6: c8        loc_06a6        INY                 ;     Add 1 to Y
06a7: d0 ec                     BNE decryptPage     ;     If (Y != 0) Then
                                                    ;         Continue Loop               (decrypt next byte)
                                                    ;     End If
06a9: e6 83                     INC DecryptAddr_H   ;     Add 1 to DecryptAddr_H          (next page)
06ab: c6 85                     DEC DecryptPages    ;     Subtract 1 from DecryptPages
06ad: d0 e6                     BNE decryptPage     ; Repeat while (DecryptPages != 0)
06af: 4c 7e 80                  JMP kernelEntry     ; Continue @ $807e [kernelEntry]

06b2: 00 00 00  UnusedBytes     .BYTE $00,$00,$00
06b5: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00
06bd: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00
06c5: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00
06cd: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00
06d5: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00
06dd: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00
06e5: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00
06ed: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00
06f5: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00
06fd: 00 00 00                  .BYTE $00,$00,$00
