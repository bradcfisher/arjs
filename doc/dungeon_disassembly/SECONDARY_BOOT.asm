
0600: a9 52     LOAD_KERNEL     LDA #$52            ; Request disk operation
0602: 8d 02 03                  STA DCOMND          ;     $52 (Read sector)

; Load game kernel key sector @ $100
0605: a9 00                     LDA #$00            ; Set destination
0607: 8d 04 03                  STA DBUFLO          ;     buffer
060a: a9 01                     LDA #$01            ;     address
060c: 8d 05 03                  STA DBUFHI          ;     to $100 (KEY_SECTOR)
060f: a9 05                     LDA #$05            ; Set
0611: 8d 0a 03                  STA DAUX1           ;     sector to
0614: a9 02                     LDA #$02            ;     read to
0616: 8d 0b 03                  STA DAUX2           ;     $0205 (517)
0619: 20 53 e4                  JSR DSKINV          ; Read sector from disk

; Load game kernel @ $1400
061c: ee 0a 03                  INC DAUX1           ; Select next sector $0206 (518)
061f: a9 00                     LDA #$00            ; Set destination
0621: 8d 04 03                  STA DBUFLO          ;     buffer
0624: a9 14                     LDA #$14            ;     address
0626: 8d 05 03                  STA DBUFHI          ;     to $1400
0629: a9 9e                     LDA #$9e            ; Set number of sectors
062b: 85 80                     STA NUM_SECTORS     ;     to read to $9e (158) [$4F00 / 20224 bytes]
062d: 20 4e 06                  JSR READ_SECTOR     ; Read the sectors to the destination

; Load ?? @ $8000
0630: a9 cd                     LDA #$cd            ; Set
0632: 8d 0a 03                  STA DAUX1           ;     sector to
0635: a9 00                     LDA #$00            ;     read to
0637: 8d 0b 03                  STA DAUX2           ;     $00CD (205)
063a: a9 00                     LDA #$00            ; Set destination
063c: 8d 04 03                  STA DBUFLO          ;     buffer
063f: a9 80                     LDA #$80            ;     address
0641: 8d 05 03                  STA DBUFHI          ;     to $8000
0644: a9 14                     LDA #$14            ; Set number of sectors
0646: 85 80                     STA NUM_SECTORS     ;     to read to $14 (20 sectors) [$A00 / 2560 bytes]
0648: 20 4e 06                  JSR READ_SECTORS    ; Read sectors from disk
064b: 4c 6f 06                  JMP PREPARE_KEY     ;

; Reads multiple sectors from disk
064e: 20 53 e4  READ_SECTORS    JSR DSKINV          ; Read the sector to the buffer address
0651: ee 0a 03                  INC DAUX1           ; Select
0654: d0 03                     BNE loc_0659        ;     next sector
0656: ee 0b 03                  INC DAUX2           ;     (16 bit add)
0659: ad 04 03  loc_0659        LDA DBUFLO          ; Move destination
065c: 18                        CLC                 ;     buffer address
065d: 69 80                     ADC #$80            ;     forward
065f: 8d 04 03                  STA DBUFLO          ;     by the
0662: ad 05 03                  LDA DBUFHI          ;     size of
0665: 69 00                     ADC #$00            ;     one sector
0667: 8d 05 03                  STA DBUFHI          ;     (e.g. add $80 / 128 bytes)
066a: c6 80                     DEC NUM_SECTORS     ; Decrease sector count
066c: d0 e0                     BNE READ_SECTOR     ; Repeat until all sectors have been read
066e: 60                        RTS                 ; Return to caller

; Decrypt the game kernel

; Prepare the decryption key
; Repeat first 16 bytes over the entire 128 byte key sector data
066f: a0 00     PREPARE_KEY     LDY #$00            ; Y = 0 (Key sector index: 0..127)
0671: a2 00     loc_0671        LDX #$00            ; X = 0 (Encryption key byte index: 0..15)
0673: bd 00 01  loc_0673        LDA KEY_SECTOR,X    ; Read byte @ $100 + X into A
0676: 99 00 01                  STA KEY_SECTOR,Y    ; Store encryption key byte back to $100 + Y
0679: c8                        INY                 ; Move to next byte in key sector
067a: 30 07                     BMI DCRYPT_KERNEL   ;     Exit loop if high bit set (moved past end of 128 byte sector)
067c: e8                        INX                 ; Select next key byte to copy
067d: e0 10                     CPX #$10            ; If encryption key index < 16
067f: 90 f2                     BCC loc_0673        ;     Then process next byte
0681: b0 ee                     BCS loc_0671        ;     Else reset encryption key index back to 0 and process next byte

; Decrypt the game kernel bytes
0683: a0 00     DCRYPT_KERNEL   LDY #$00            ; Y = 0 (current byte index)
0685: 84 86                     STY $86             ; $86 = 0    - VVTP (BASIC variable value table) unused?
0687: 84 87                     STY $87             ; $87 = 0    - VVTP+1 (BASIC variable value table) unused?
0689: 84 82                     STY DCRYPT_ADDR     ; Load kernel
068b: a9 14                     LDA #$14            ;     start address $1400
068d: 85 83                     STA DCRYPT_ADDR+1   ;     to DCRYPT_ADDR ($82, $83)
068f: a9 4f                     LDA #$4f            ; Set number of memory pages
0691: 85 85                     STA NUM_DCRYPT      ;     to decrypt to $4f (79 pages / 20224 bytes)
0693: a2 00                     LDX #$00            ; X = 0 (Encryption key byte index)
0695: b1 82     DCRYPT_PAGE     LDA (DCRYPT_ADDR),Y ; Read byte @ $1400 + Y into A
0697: 4a                        LSR                 ; Shift bits in A right one place
0698: 90 02                     BCC loc_069c        ; If bit 0 was 0, skip next op
069a: 09 80                     ORA #$80            ; If bit 1 was 1, set bit 7 (e.g. rotate A right 1 bit)
069c: 5d 00 01  loc_069c        EOR KEY_SECTOR,X    ; XOR accumulator with byte @ $100 + X (encryption key byte)
069f: 91 82                     STA (DCRYPT_ADDR),Y ; Write decrypted byte in A back to $1400 + Y
06a1: e8                        INX                 ; Increment encryption key byte index
06a2: 10 02                     BPL loc_06a6        ; Skip next instruction if sign bit not set (bytes 0..127)
06a4: a2 00                     LDX #$00            ; Reset encryption key offset back to 0 if sign bit is set
06a6: c8        loc_06a6        INY                 ; Select next byte to decrypt
06a7: d0 ec                     BNE DCRYPT_PAGE     ; If no overflow, decrypt next byte
06a9: e6 83                     INC DCRYPT_ADDR+1   ; Otherwise, move to next page
06ab: c6 85                     DEC NUM_DCRYPT      ; While more pages to decrypt
06ad: d0 e6                     BNE DCRYPT_PAGE     ;    decrypt next byte
06af: 4c 7e 80                  JMP KRNL_ENTRY      ; Jump to kernel entry vector $807E