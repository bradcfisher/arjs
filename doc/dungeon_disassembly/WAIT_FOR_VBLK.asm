; Waits for the byte at VBLK_COUNTER to update
; That value is updated in the HANDLE_VBLKI interrupt handler
;
2454: AD 52 02  WAIT_FOR_VBLK_A  LDA VBLK_COUNTER
2457: CD 52 02  VBLK_WAIT_LOOP_A CMP VBLK_COUNTER
245A: F0 FB                      BEQ VBLK_WAIT_LOOP_A
245C: 60                         RTS

; A second copy of the same logic as above
2C66: AD 52 02  WAIT_FOR_VBLK_B  LDA VBLK_COUNTER
2C69: CD 52 02  VBLK_WAIT_LOOP_B CMP VBLK_COUNTER
2C6C: F0 FB                      BEQ VBLK_WAIT_LOOP_B
2C6E: 60                         RTS
