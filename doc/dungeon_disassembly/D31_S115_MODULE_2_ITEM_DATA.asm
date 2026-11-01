
; 0000 L2a00 @7600 [exe]
* = $7600

7600: 02        ModuleNumber    .BYTE $02            ; Module 2: Item Data

7601: 4c 08 76  moduleInit      JMP initModule2      ;
7604: 4c 07 76  moduleEntry2    JMP moduleEntry3     ; NOP
7607: 60        moduleEntry3    RTS                  ; NOP

                ; Entry point called after the module is loaded.
                ;
                ; - Disables keyboard actions
                ; - Adds a new blank status page
                ; - Sets contAddItems as the game loop callback
                ;
                ; Temp
                ;   StrTmplate_L/H - Updated to set the status page
                ;
7608: ce 37 19  initModule2     DEC AllowActions     ; Subtract 1 from AllowActions                    (Disable actions)
760b: a9 61                     LDA #$61             ; Set
760d: 85 16                     STA StrTmplate_L     ;     StrTmplate_L/H
760f: a9 95                     LDA #$95             ;     to
7611: 85 17                     STA StrTmplate_H     ;     $9561 [StrClrMsgRows]
7613: 20 4b 18                  JSR j_addStatPage    ; Call $184b [j_addStatPage]
7616: ae 33 19                  LDX CurStatusPage    ; Set
7619: 8e df 78                  STX ModuleStatusPg   ;     ModuleStatusPg = CurStatusPage
761c: a9 3b                     LDA #$3b             ; Set
761e: 8d 77 19                  STA cont_addr_1977_L ;     cont_addr_1977_L/H
7621: a9 76                     LDA #$76             ;     to
7623: 8d 78 19                  STA cont_addr_1977_H ;     $763b [contAddItems]
7626: 60                        RTS                  ; Return to caller

                ; contAddItems continues here to return control back to the main game loop
                ;
                ; - Re-enables actions, removes status page, sets the ForceGetFlag and sets MapLocSpclType and
                ;   TextureStart to $ff.
                ; - Continues @ $3183 [j_sub_3183] to reload the map and continue game play
                ;
7627: ee 37 19  contRtrnToGame  INC AllowActions     ; Add 1 to AllowActions                            (enable actions)
762a: 20 4e 18                  JSR j_remStatPage    ; Call $184e [j_remStatPage]
762d: a9 ff                     LDA #$ff             ; Set
762f: 8d 59 19                  STA MapLocSpclType   ;     MapLocSpclType = $ff (255)
7632: 8d f0 96                  STA TextureStart     ; Set TextureStart = $ff (255)
7635: ce 7b 19                  DEC ForceGetFlg      ; Subtract 1 from ForceGetFlg
7638: 4c 0c 18                  JMP j_sub_3183       ; Continue @ $3183 [j_sub_3183]

                ; Entry point called from the main game loop which handles adding item(s) to the game then returns
                ; to normal game play.
                ;
                ; - When MapLocSpclType is 1
                ;   - Displays the message prompt corresponding to the treasure item identified in MapLocSpclNum
                ;   - Adds the item to the game inventory
                ; - Otherwise
                ;   - When dat_758a bit 7 is 1 and bit 6 is 0
                ;     - A check is performed for any required quest items which are no longer in the game. If one is
                ;       found, it is added. If no missing item is found, an item will be selected from category 2
                ;       (Wands/Eyes/Horns) instead.
                ;     - An item from category 1 (Scrolls & Cards) is also added.
                ;   - If dat_758a bit 7 is 0 or bit 6 is 1
                ;     - An item from the category identified by the lower three bits of dat_758a will be selected.
                ;     - An item from the category specified in dat_758b is added (or none if 0).
                ;
                ; Input
                ;   MapLocSpclType - The current location's special code "type" (the value of bits 4..6 of the code)
                ;   MapLocSpclNum  - Holds special code index number parameter value (0...31) for
                ;                    treasure, encounter, message, and teleport special codes.
                ;   dat_758a       - If bit 7 is 0, the value should be 0 through 6 and an item of the specified
                ;                    category is chosen (or no item if 0).
                ;                    When bit 7 is 1 then bit 6 is consulted and:
                ;                      If bit 6 is 0, a check is performed for any required quest items which are no
                ;                        longer in the game. If one is found, it is added. If no missing item is found,
                ;                        an item will be selected from category 2 (Wands/Eyes/Horns) instead.
                ;                      If bit 6 is 1, an item from the category identified by the lower three bits will
                ;                        be selected.
                ;   dat_758b       - When dat_758a bit 7 is 0 or bit 6 is 1 an item from the category specified is
                ;                    added (or none if 0). Any input value is ignored when dat_758a bit 7 is 1 and
                ;                    bit 6 is 0.
                ;
763b: ad 59 19  contAddItems    LDA MapLocSpclType   ; If
763e: c9 01                     CMP #$01             ;    (MapLocSpclType == 1)                       (1 = Treasure)
7640: d0 25                     BNE loc_7667         ; Then
7642: ae 5a 19                  LDX MapLocSpclNum    ;     Set X = MapLocSpclNum
7645: bd 2e 9e                  LDA TreasureTmpl_L,X ;     Set
7648: 85 16                     STA StrTmplate_L     ;         StrTmplate_L/H
764a: bd 4e 9e                  LDA TreasureTmpl_H,X ;         to
764d: 85 17                     STA StrTmplate_H     ;         TreasureTmpl_L/H[X]
764f: bc 86 94                  LDY TreasureAdr_L,X  ;     Set Y = TreasureAdr_L[X]
7652: bd a6 94                  LDA TreasureAdr_H,X  ;     Set
7655: aa                        TAX                  ;         X = TreasureAdr_H[X]
7656: 20 d3 76                  JSR addNewItem       ;     Call $76d3 [addNewItem]
7659: 30 cc                     BMI contRtrnToGame   ;     If (N == 1) Then
765b: ae df 78                  LDX ModuleStatusPg   ;         Set X = ModuleStatusPg
765e: 20 51 18                  JSR j_setStatPgStr2  ;         Call $1851 [j_setStatPgStr2]
7661: 20 3c 18                  JSR j_pressAnyKey    ;         Call $183c [j_pressAnyKey]
                                                     ;     End If
7664: 4c 27 76                  JMP contRtrnToGame   ;     Continue @ $7627 [contRtrnToGame]
7667: 2c 8a 75  loc_7667        BIT dat_758a         ; Else If
766a: 10 20                     BPL loc_768c         ;    (dat_758a & $80 != 0)                       (bit 7 set)
766c: 50 05                     BVC loc_7673         ;    And (
766e: 20 3a 77                  JSR lostQuestItem    ;      (dat_758a & $40 == 0)                     (bit 6 not set)
7671: 30 19                     BMI loc_768c         ;      Or
7673: ad 8a 75  loc_7673        LDA dat_758a         ;      (call $773a [lostQuestItem] , N == 0)
7676: 29 7f                     AND #$7f             ;    ) And
7678: c9 08                     CMP #$08             ;    ((dat_758a & $7f) < 8)
767a: b0 10                     BCS loc_768c         ; Then
767c: aa                        TAX                  ;     Set X = dat_758a & $7f
767d: bc 4f 95                  LDY QuestItem_L,X    ;     Set Y = QuestItem_L[X]
7680: bd 57 95                  LDA QuestItem_H,X    ;     Set
7683: aa                        TAX                  ;         X = QuestItem_H[X]
7684: 20 d3 76                  JSR addNewItem       ;     Call $76d3 [addNewItem]
7687: a9 00                     LDA #$00             ;     Set
7689: 8d 8a 75                  STA dat_758a         ;         dat_758a = 0     (quest item added, don't select another)
                                                     ; End If
768c: ad 8a 75  loc_768c        LDA dat_758a         ; Set A = dat_758a
768f: 20 9b 76                  JSR selectReward     ; Call $769b [selectReward]
7692: ad 8b 75                  LDA dat_758b         ; Set A = dat_758b
7695: 20 9b 76                  JSR selectReward     ; Call $769b [selectReward]
7698: 4c 27 76                  JMP contRtrnToGame   ; Continue @ $7627 [contRtrnToGame]

                ; Randomly chooses an item from a provided category and adds the item to the game inventory.
                ;
                ; Input
                ;   A    - Item category number. Only the lower 3 bits of this value are used.
                ;           0: none, the sub returns immediately
                ;           1: Cards, Tomes
                ;           2: Wands, Eyes, Horns
                ;           3: Weapons & Armor
                ;           4: Armor
                ;           5: Apparel
                ;           6: Potions
                ;           7: unsupported / undefined (off-by-one bug? Only 6 categories defined in lookup table)
                ;
769b: 29 07     selectReward    AND #$07             ; A = A & 7
                                                     ; If (A == 0) Then
769d: d0 01                     BNE loc_76a0         ;     Return to caller
769f: 60                        RTS                  ; End If
76a0: aa        loc_76a0        TAX                  ; Set
76a1: ca                        DEX                  ;     X = A - 1                  (X = item category index)
76a2: bd 43 95                  LDA ChanceTbls_L,X   ; Set
76a5: 85 07                     STA SourceAdr_L      ;     SourceAdr_L/H
76a7: bd 49 95                  LDA ChanceTbls_H,X   ;     to
76aa: 85 08                     STA SourceAdr_H      ;     ChanceTbls_L/H[X]
76ac: ad 0a d2                  LDA RANDOM           ; Set
76af: 8d de 78                  STA ItemRoll         ;     ItemRoll = random byte     (roll for item)
76b2: a0 00                     LDY #$00             ; Set Y = 0                      (scan table for first item greater
76b4: b1 07     loc_76b4        LDA (SourceAdr_L),Y  ; Loop                                   than or equal to the roll)
                                                     ;     Set A = (*SourceAdr_L)[Y]
76b6: cd de 78                  CMP ItemRoll         ;     If (A < ItemRoll) Then
76b9: b0 03                     BCS loc_76be         ;         Add 1 to Y
76bb: c8                        INY                  ;     End If
76bc: d0 f6                     BNE loc_76b4         ; Repeat while (A < ItemRoll)
76be: 98        loc_76be        TYA                  ; Set
76bf: 0a                        ASL                  ;     Y
76c0: a8                        TAY                  ;       =
76c1: c8                        INY                  ;         Y * 2 + 1              (offset of item address)
76c2: bd 7a 94                  LDA CategryTbls_L,X  ; Set
76c5: 85 07                     STA SourceAdr_L      ;     SourceAdr_L/H
76c7: bd 80 94                  LDA CategryTbls_H,X  ;     to
76ca: 85 08                     STA SourceAdr_H      ;     CategryTbls_L/H[X]
76cc: b1 07                     LDA (SourceAdr_L),Y  ; Set
76ce: aa                        TAX                  ;     X = (*SourceAdr_L)[Y]
76cf: 88                        DEY                  ; Subtract 1 from Y
76d0: b1 07                     LDA (SourceAdr_L),Y  ; Set
76d2: a8                        TAY                  ;     Y = (*SourceAdr_L)[Y]      (Y/X = address of item selected)
                                                     ; (continues to following sub)

                ; Adds a new item to the game inventory & dropped item list.
                ;
                ; If space is available for the new item:
                ;   - If the item is a potion, there is a 25% chance a wisdom check is required to identify the potion
                ;     type. When the wisdom check is attempted, a random byte is chosen and the value is divided by 2.
                ;     The potion will be unidentified if the result is greater or equal to the player's WIS stat.
                ;   - The item is added to the dropped item list with the player's current location.
                ;
                ; If insufficient space is available to add the new item, then the item is not added to the inventory.
                ;
                ; Input
                ;   Y/X    - Address of new item to add
                ;
76d3: 20 84 18  addNewItem      JSR j_addItem        ; Call $1884 [j_addItem]                    (param Y/X)
76d6: 30 61                     BMI loc_7739         ; If (N == 0) Then                          (added ok)
76d8: a0 00                     LDY #$00             ;     Set Y = 0
76da: b1 41                     LDA (ItemAdr_L),Y    ;     If
76dc: 29 07                     AND #$07             ;        (((*ItemAdr_L)[0] & 7) == 6)       (type 6 = Potion)
76de: c9 06                     CMP #$06             ;
76e0: d0 16                     BNE loc_76f8         ;        And
76e2: ad 0a d2                  LDA RANDOM           ;        (Random byte >= $40 (64))          (75% chance no check)
76e5: c9 40                     CMP #$40             ;
76e7: 90 0f                     BCC loc_76f8         ;        And
76e9: ad 0a d2                  LDA RANDOM           ;
76ec: 4a                        LSR                  ;        (Random byte / 2 >= ChrWisCalc)
76ed: cd 69 63                  CMP ChrWisCalc       ;
76f0: 90 06                     BCC loc_76f8         ;     Then                            (Mark potion as unidentified)
76f2: a0 0c                     LDY #$0c             ;         Set Y = $0c (12)  (6 byte header + 6 letters in "Potion")
76f4: a9 00                     LDA #$00             ;         Set
76f6: 91 41                     STA (ItemAdr_L),Y    ;             (*ItemAdr_L)[12] = 0         (Set NUL after "Potion")
                                                     ;     End If
76f8: ae 93 64  loc_76f8        LDX NextDropped      ;     Set X = NextDropped
76fb: bd 94 64                  LDA DroppedGame,X    ;     If
76fe: 29 7f                     AND #$7f             ;        ((DroppedGame[X] & $7f) != 0)     (dropped item present)
7700: f0 0c                     BEQ loc_770e         ;     Then
7702: a5 4b                     LDA ItemIndex        ;         Push
7704: 48                        PHA                  ;              ItemIndex to the stack
7705: bd d4 64                  LDA DroppedItmIdx,X  ;         Set A = DroppedItmIdx[X]         (remove dropped item)
7708: 20 8a 18                  JSR j_removeItem     ;         Call $188a [j_removeItem]        (param A)
770b: 68                        PLA                  ;         Restore
770c: 85 4b                     STA ItemIndex        ;             ItemIndex from stack
                                                     ;     End If
770e: a5 4b     loc_770e        LDA ItemIndex        ;     Set A = ItemIndex
7710: 20 87 18                  JSR j_getItemAdr     ;     Call $1887 [j_getItemAdr]            (param A)
7713: ae 93 64                  LDX NextDropped      ;     Set X = NextDropped
7716: ad 13 63                  LDA CHR_LOC_X        ;     Set
7719: 9d a4 64                  STA DroppedX,X       ;         DroppedX[X] = CHR_LOC_X
771c: ad 14 63                  LDA CHR_LOC_Y        ;     Set
771f: 9d b4 64                  STA DroppedY,X       ;         DroppedY[X] = CHR_LOC_Y
7722: ad 15 63                  LDA CHR_LOC_MAP      ;     Set
7725: 9d c4 64                  STA DroppedMap,X     ;         DroppedMap[X] = CHR_LOC_MAP
7728: a9 02                     LDA #$02             ;     Set
772a: 9d 94 64                  STA DroppedGame,X    ;         DroppedGame[X] = 2               (2 = Dungeon)
772d: a5 4b                     LDA ItemIndex        ;     Set
772f: 9d d4 64                  STA DroppedItmIdx,X  ;         DroppedItmIdx[X] = ItemIndex
7732: e8                        INX                  ;     Add
7733: 8a                        TXA                  ;         1 to X
7734: 29 0f                     AND #$0f             ;     Set
7736: 8d 93 64                  STA NextDropped      ;         NextDropped = X & 15
                                                     ; End If
7739: 60        loc_7739        RTS                  ; Return to caller

                ; Identifies a quest item which the player should have in their inventory, but which is not present
                ;     (for example, if the player dropped the item).
                ;
                ; Note: Some memory locations used by this sub (NumStaffFlags, NumStaffPieces) are not initialized in
                ;       the sub before use. Due to this, the sub should only be called a single time after the module
                ;       is loaded to avoid an incorrect outcome.
                ;
                ; Output
                ;   A         - Set to the same value as dat_758a
                ;   N         - 0 if a quest item was identified; 1 if not found
                ;   dat_758a  - Set to an item index value
                ;                 - If a specific quest point has been reached (or not) and the player doesn't have an
                ;                   item related to that point in the quest, then the item will be the reward. In this
                ;                   case the value will be one of 0 to 7 (an index into QuestItem_L/H), depending on
                ;                   quest progression and missing item.
                ;                 - If none of the quest-specific logic is matched, the value $82 is returned
                ;                   (bit 7 set indicates no quest item match found, lower bits are an item category
                ;                    number (2 = Weapons & Shields) from which an item should be chosen)
                ;   dat_758b  - Set to 1 (Cards/Tomes)
                ;
                ; ???
                ;   dat_7589    - Subtracted from NumStaffFlags to compute final number of staff pieces outstanding.
                ;                 ??Possibly the number of staff pieces given to Acrinimiril??
                ;
                ; Temp
                ;   QuestItemId    - hasQuestItmBfr param: Quest item ID to check for
                ;   QuestItemIndex - hasQuestItmBfr param: Index to start searching from
                ;   NumStaffFlags  - Used to count number of staff piece quest completion flags set. Note this is not
                ;                    initialized in the sub itself, and thus may only be valid for the first call to
                ;                    the sub after the module is loaded.
                ;   NumStaffPieces - Used to count number of staff pieces in inventory. Note this is not initialized
                ;                    in the sub itself, and thus may only be valid for the first call to the sub after
                ;                    the module is loaded.
                ;   Num            - Loop control var
                ;   StaffQuestBit  - Holds quest bit index to test for staff piece loop
                ;
773a: a9 82     lostQuestItem   LDA #$82             ; Set
773c: 8d 8a 75                  STA dat_758a         ;     dat_758a = $82 (130 / $80 + 2 (TrollRingHalf?))
773f: a9 01                     LDA #$01             ; Set
7741: 8d 8b 75                  STA dat_758b         ;     dat_758b = 1
7744: a9 13                     LDA #$13             ; Set A = $13 (19)
7746: 20 a1 78                  JSR isQuestFlagSet   ; Call $78a1 [isQuestFlagSet]    (param A)
7749: b0 0f                     BCS loc_775a         ; If (C == 0) Then               (bit 19 NOT set: Master Thief)
774b: a9 07                     LDA #$07             ;     Set A = 7                  (SilverKey ID)
774d: 20 a8 78                  JSR hasQuestItem     ;     Call $78a8 [hasQuestItem]  (param A)
7750: b0 08                     BCS loc_775a         ;     If (C == 0) Then           (no SilverKey found)
7752: a9 00                     LDA #$00             ;         Set
7754: 8d 8a 75                  STA dat_758a         ;             dat_758a = 0       (SilverKey index in QuestItem_L/H)
7757: 4c 9d 78                  JMP loc_789d         ;         Continue @ $789d [loc_789d]
                                                     ;     End If
                                                     ; End If
775a: a9 18     loc_775a        LDA #$18             ; Set A = $18 (24)
775c: 20 a1 78                  JSR isQuestFlagSet   ; Call $78a1 [isQuestFlagSet]    (param A)
775f: 90 0f                     BCC loc_7770         ; If (C == 1) Then               (bit 24 set: Acrinimiril done)
7761: a9 01                     LDA #$01             ;     Set A = 1                  (PacCard ID)
7763: 20 a8 78                  JSR hasQuestItem     ;     Call $78a8 [hasQuestItem]  (param A)
7766: b0 5f                     BCS loc_77c7         ;     If (C == 1) Then
                                                     ;         Continue @ $77c7 [loc_77c7]   (found PAC Card)
                                                     ;     End If
7768: a9 04                     LDA #$04             ;     Set
776a: 8d 8a 75                  STA dat_758a         ;         dat_758a = 4           (PacCard index in QuestItem_L/H)
776d: 4c 9d 78                  JMP loc_789d         ;     Continue @ $789d [loc_789d]
                                                     ; End If
7770: a9 13     loc_7770        LDA #$13             ; Set
7772: 8d e5 78                  STA StaffQuestBit    ;     StaffQuestBit = $13 (19)   (incremented in loop: [19..21])
7775: a9 03                     LDA #$03             ; Set
7777: 8d e4 78                  STA Num              ;     Num = 3                    (3 iterations: [3..1])
777a: ad e5 78  loc_777a        LDA StaffQuestBit    ; Loop
                                                     ;     Set A = StaffQuestBit
777d: 20 a1 78                  JSR isQuestFlagSet   ;     Call $78a1 [isQuestFlagSet] (param A)
7780: 90 03                     BCC loc_7785         ;     If (C == 1) Then            (bit A is set)
7782: ee e2 78                  INC NumStaffFlags    ;         Add 1 to NumStaffFlags
                                                     ;     End If
7785: ee e5 78  loc_7785        INC StaffQuestBit    ;     Add 1 to StaffQuestBit
7788: ce e4 78                  DEC Num              ;     Subtract 1 from Num
778b: d0 ed                     BNE loc_777a         ; Repeat while (Num != 0)
778d: ad e2 78                  LDA NumStaffFlags    ; If (NumStaffFlags == 0) Then
7790: d0 03                     BNE loc_7795         ;     Continue @ $77c7 [loc_77c7]
7792: 4c c7 77                  JMP loc_77c7         ; End If
7795: a9 03     loc_7795        LDA #$03             ; Set
7797: 8d e4 78                  STA Num              ;     Num = 3
779a: a9 40                     LDA #$40             ; Set
779c: 8d e1 78                  STA QuestItemIndex   ;     QuestItemIndex = $40 (64)
779f: a9 06                     LDA #$06             ; Set
77a1: 8d e0 78                  STA QuestItemId      ;     QuestItemId = 6
77a4: 20 d5 78  loc_77a4        JSR hasQuestItmBfr   ; Loop
                                                     ;     Call $78d5 [hasQuestItmBfr]     (QuestItemId, QuestItemIndex)
77a7: 90 08                     BCC loc_77b1         ;     If (C == 0) Then
                                                     ;         Exit Loop
                                                     ;     End If
77a9: ee e3 78                  INC NumStaffPieces   ;     Add 1 to NumStaffPieces
77ac: ce e4 78                  DEC Num              ;     Subtract 1 from Num
77af: d0 f3                     BNE loc_77a4         ; Repeat while (Num != 0)
77b1: 38        loc_77b1        SEC                  ; Set C = 1
77b2: ad e2 78                  LDA NumStaffFlags    ; Set
77b5: ed 89 75                  SBC dat_7589         ;     A = NumStaffFlags - dat_7589       (C = 0 on overflow else 1)
77b8: f0 0d                     BEQ loc_77c7         ; If (A != 0) Then
77ba: ed e3 78                  SBC NumStaffPieces   ;     Set A = A - NumStaffPieces - ~C    (C = 0 on overflow else 1)
77bd: f0 08                     BEQ loc_77c7         ;     If (A != 0) Then
77bf: a9 03                     LDA #$03             ;         Set
77c1: 8d 8a 75                  STA dat_758a         ;             dat_758a = 3     (StaffPiece index in QuestItem_L/H)
77c4: 4c 9d 78                  JMP loc_789d         ;         Continue @ $789d [loc_789d]
                                                     ;     End If
                                                     ; End If
77c7: a9 01     loc_77c7        LDA #$01             ; Set A = 1                      (Clothes Horse/Mirrored Shield)
77c9: 20 a1 78                  JSR isQuestFlagSet   ; Call $78a1 [isQuestFlagSet]    (param A)
77cc: b0 03                     BCS loc_77d1         ; If (C == 1)
77ce: 4c 24 78                  JMP loc_7824         ; Then                           (Search inv. for Mirrored Shield)
77d1: a9 3f     loc_77d1        LDA #$3f             ;     Set
77d3: 8d e1 78                  STA QuestItemIndex   ;         QuestItemIndex = $3f   (64 iterations [63..0])
77d6: ad e1 78  loc_77d6        LDA QuestItemIndex   ;     Loop
                                                     ;         Set A = QuestItemIndex
77d9: 20 87 18                  JSR j_getItemAdr     ;         Call $1887 [j_getItemAdr]   (param A)
77dc: f0 39                     BEQ loc_7817         ;         If (Z != 0)                 (item present in slot)
77de: a0 00                     LDY #$00             ;
77e0: b1 41                     LDA (ItemAdr_L),Y    ;            And
77e2: 29 7f                     AND #$7f             ;            ((*ItemAdr_L)[0] & $7f
77e4: c9 03                     CMP #$03             ;               == 3)                 (3 = weapon/shield)
77e6: d0 2f                     BNE loc_7817         ;         Then
77e8: 18                        CLC                  ;             Set
77e9: a5 41                     LDA ItemAdr_L        ;                 SourceAdr_L/H
77eb: 69 06                     ADC #$06             ;                    =
77ed: 85 07                     STA SourceAdr_L      ;                      ItemAdr_L/H + 6   (Item name)
77ef: a5 42                     LDA ItemAdr_H        ;               .
77f1: 69 00                     ADC #$00             ;               .
77f3: 85 08                     STA SourceAdr_H      ;               .
77f5: a0 00                     LDY #$00             ;             If
77f7: b1 07                     LDA (SourceAdr_L),Y  ;                ((*SourceAdr_L)[0] == $7f)    (enchanted "⚡︎")
77f9: c9 7f                     CMP #$7f             ;
77fb: d0 0b                     BNE loc_7808         ;             Then
77fd: a5 07                     LDA SourceAdr_L      ;                 Set
77ff: 18                        CLC                  ;                     SourceAdr_L/H
7800: 69 02                     ADC #$02             ;                        =
7802: 85 07                     STA SourceAdr_L      ;                          SourceAdr_L/H + 2   (skip "⚡︎ ")
7804: 90 02                     BCC loc_7808         ;                   .
7806: e6 08                     INC SourceAdr_H      ;                   .
                                                     ;             End If
7808: a0 0e     loc_7808        LDY #$0e             ;             Set Y = $0e (14)
780a: b1 07     loc_780a        LDA (SourceAdr_L),Y  ;             Loop
780c: d9 c0 8e                  CMP MirrorShield+6,Y ;               If (MirrorShield[6 + Y] != (*SourceAdr_L)[Y]) Then
780f: d0 06                     BNE loc_7817         ;                     Exit Loop  (NOT mirrored shield)
                                                     ;                 End If
7811: 88                        DEY                  ;                 Subtract 1 from Y
7812: 10 f6                     BPL loc_780a         ;             Repeat while (Y >= 0)
7814: 4c 24 78                  JMP loc_7824         ;             If (Y < 0) Then               (Found Mirrored Shield)
                                                     ;                 Continue @ $7824 [loc_7824]
                                                     ;             End If
                                                     ;         End If
7817: ce e1 78  loc_7817        DEC QuestItemIndex   ;         Subtract 1 from QuestItemIndex
781a: 10 ba                     BPL loc_77d6         ;     Repeat while (QuestItemIndex >= 0)
781c: a9 05                     LDA #$05             ;     Set
781e: 8d 8a 75                  STA dat_758a         ;         dat_758a = 5        (MirrorShield index in QuestItem_L/H)
7821: 4c 9d 78                  JMP loc_789d         ; Else
7824: ad 0a d2  loc_7824        LDA RANDOM           ;     If
7827: cd 85 63                  CMP ChrAlign         ;        (random byte < ChrAlign)       (More good -> more likely?)
782a: b0 1d                     BCS loc_7849         ;        And
782c: a9 15                     LDA #$15             ;
782e: 20 a1 78                  JSR isQuestFlagSet   ;        [ Call $78a1 [isQuestFlagSet]  (param A = $15 (21)) ]
7831: b0 16                     BCS loc_7849         ;        (C == 0)
7833: a9 16                     LDA #$16             ;        And
7835: 20 a1 78                  JSR isQuestFlagSet   ;        [ Call $78a1 [isQuestFlagSet]  (param A = $16 (22)) ]
7838: 90 0f                     BCC loc_7849         ;        (C == 1)
783a: a9 08                     LDA #$08             ;        And
783c: 20 a8 78                  JSR hasQuestItem     ;        [ Call $78a8 [hasQuestItem]  (param A = 8 : Bloodstone) ]
783f: b0 08                     BCS loc_7849         ;        (C == 0)
                                                     ;     Then
7841: a9 07                     LDA #$07             ;         Set
7843: 8d 8a 75                  STA dat_758a         ;             dat_758a = 7      (Bloodstone index in QuestItem_L/H)
7846: 4c 9d 78                  JMP loc_789d         ;     Else If
7849: a9 00     loc_7849        LDA #$00             ;        [ Call $78a1 [isQuestFlagSet]  (param A = 0) ]
784b: 20 a1 78                  JSR isQuestFlagSet   ;        (C == 0)
784e: b0 4d                     BCS loc_789d         ;     Then
7850: a9 17                     LDA #$17             ;         Set A = $17 (23)
7852: 20 a1 78                  JSR isQuestFlagSet   ;         Call $78a1 [isQuestFlagSet]  (param A)
7855: 90 0f                     BCC loc_7866         ;         If (C == 1) Then
7857: a9 02                     LDA #$02             ;             Set A = 2                  (Reforged Ring ID)
7859: 20 a8 78                  JSR hasQuestItem     ;             Call $78a8 [hasQuestItem]  (param A = 2)
785c: b0 3f                     BCS loc_789d         ;             If (C == 0) Then
785e: a9 06                     LDA #$06             ;                 Set                    (ReforgedRing index
7860: 8d 8a 75                  STA dat_758a         ;                     dat_758a = 6        in QuestItem_L/H)
7863: 4c 9d 78                  JMP loc_789d         ;             End If
7866: a9 0d     loc_7866        LDA #$0d             ;         Else If
7868: 20 a1 78                  JSR isQuestFlagSet   ;            [ Call $78a1 [isQuestFlagSet]  (param A = 13) ]
786b: b0 30                     BCS loc_789d         ;            (C == 0)
786d: a9 0e                     LDA #$0e             ;            And
786f: 20 a1 78                  JSR isQuestFlagSet   ;            [ Call $78a1 [isQuestFlagSet]  (param A = 14) ]
7872: b0 29                     BCS loc_789d         ;            (C == 0)
7874: a9 0b                     LDA #$0b             ;         Then
7876: 20 a1 78                  JSR isQuestFlagSet   ;             If [ Call $78a1 [isQuestFlagSet]  (param A = 11) ]
7879: 90 0f                     BCC loc_788a         ;                (C == 1)
787b: a9 04                     LDA #$04             ;                And                          (TrollRingHalf ID)
787d: 20 a8 78                  JSR hasQuestItem     ;                [ Call $78a8 [hasQuestItem]  (param A = 4) ]
                                                     ;                (C == 0)
7880: b0 08                     BCS loc_788a         ;             Then
7882: a9 02                     LDA #$02             ;                 Set                    (TrollRingHalf index
7884: 8d 8a 75                  STA dat_758a         ;                     dat_758a = 2        in QuestItem_L/H)
7887: 4c 9d 78                  JMP loc_789d         ;             Else If
788a: a9 0c     loc_788a        LDA #$0c             ;
788c: 20 a1 78                  JSR isQuestFlagSet   ;                [ Call $78a1 [isQuestFlagSet]  (param A = 12) ]
788f: 90 0c                     BCC loc_789d         ;                (C == 1)
7891: a9 03                     LDA #$03             ;                And                          (GoblinRingHalf ID)
7893: 20 a8 78                  JSR hasQuestItem     ;                [ Call $78a8 [hasQuestItem]  (param A = 3) ]
7896: b0 05                     BCS loc_789d         ;                (C == 0)
                                                     ;             Then
7898: a9 01                     LDA #$01             ;                 Set                    (GoblinRingHalf index
789a: 8d 8a 75                  STA dat_758a         ;                     dat_758a = 1        in QuestItem_L/H)
                                                     ;             End If
                                                     ;         End If
                                                     ;     End If
                                                     ; End If
789d: ad 8a 75  loc_789d        LDA dat_758a         ; Set A = dat_758a                       (Also sets N, Z)
78a0: 60                        RTS                  ; Return to caller

                ; Tests whether a QuestFlags bit is set.
                ;
                ; Input
                ;   A     - The index of the bit to test (0..7)
                ;
                ; Output
                ;   A  - result of (X * 256 + Y)[A >> 3] & (1 << (7 - A & 7))
                ;   C  - 0 if A == 0 (bit is not set)
                ;        1 if A != 0 (bit is set)
                ;
78a1: a2 75     isQuestFlagSet  LDX #$75             ; Set
78a3: a0 08                     LDY #$08             ;     Y/X = $7508 [QuestFlags]
78a5: 4c 63 18                  JMP j_testBit        ; Continue @ $1863 [j_testBit]  (param Y/X, A)

                ; Searches the items in the game for a type 7 (Quest/Special) item with attribute byte 0 equal to 2 and
                ; attribute byte 1 equal to the value provided in A.
                ;
                ; Input
                ;   A         - Quest item ID value to match to item attribute byte 1.
                ;               Each quest item has a unique ID assigned.
                ;                 1 - PAC Card              5 - Mirrored Shield
                ;                 2 - Reforged Ring         6 - Staff Piece
                ;                 3 - Goblin Ring half      7 = Silver Key
                ;                 4 - Troll Ring half       8 - Bloodstone
                ;
                ; Output
                ;   C              - Set to 1 if a match was found, otherwise 0
                ;   QuestItemIndex - Holds the index of the item that matched, or $ff if no match was found.
                ;   QuestItemId    - Assigned the input value of A
                ;
78a8: 8d e0 78  hasQuestItem    STA QuestItemId      ; Set QuestItemId = A
78ab: a9 3f                     LDA #$3f             ; Set
78ad: 8d e1 78                  STA QuestItemIndex   ;     QuestItemIndex = $3f               (64 iterations [63..0])
78b0: ad e1 78  loc_78b0        LDA QuestItemIndex   ; Loop
                                                     ;     Set
78b3: 85 4b                     STA ItemIndex        ;         ItemIndex = QuestItemIndex
78b5: 20 87 18                  JSR j_getItemAdr     ;     Call $1887 [j_getItemAdr]    (param A)
78b8: f0 1b                     BEQ hasQuestItmBfr   ;     If (ItemAdr_H != 0) Then     (item found in specified index)
78ba: 20 96 18                  JSR j_getItemAttrs   ;         Call $1896 [j_getItemAttrs]
78bd: a0 00                     LDY #$00             ;         Set Y = 0
78bf: b1 41                     LDA (ItemAdr_L),Y    ;         If
78c1: 29 7f                     AND #$7f             ;            (((*ItemAdr_L)[0] & $7f) == 7) (type 7 = special item)
78c3: c9 07                     CMP #$07             ;
78c5: d0 0e                     BNE hasQuestItmBfr   ;            And
78c7: b1 43                     LDA (ItemAttrs_L),Y  ;            ((*ItemAttrs_L)[0] == 2)       (2 = ??)
78c9: c9 02                     CMP #$02             ;
78cb: d0 08                     BNE hasQuestItmBfr   ;         Then
78cd: c8                        INY                  ;         Add 1 to Y    (Y = 1)
78ce: b1 43                     LDA (ItemAttrs_L),Y  ;         If ((*ItemAttrs_L)[1] == QuestItemId) Then
78d0: cd e0 78                  CMP QuestItemId      ;             Continue @ $78dc [contItmFndRts]        (found match)
78d3: f0 07                     BEQ contItmFndRts    ;         End If
                                                     ;     End If

                ; Searches the items in the game prior to the index in QuestItemIndex for a type 7 (Quest/Special) item
                ; with attribute byte 0 equal to 2 and attribute byte 1 equal to the value provided in QuestItemId.
                ;
                ; Input
                ;   QuestItemId    - Quest item ID value to match to item attribute byte 1
                ;                    Each quest item has a unique ID assigned.
                ;                      1 - PAC Card              5 - Mirrored Shield
                ;                      2 - Reforged Ring         6 - Staff Piece
                ;                      3 - Goblin Ring half      7 = Silver Key
                ;                      4 - Troll Ring half       8 - Bloodstone
                ;   QuestItemIndex - The starting item index. Only items with an index less than this value will be
                ;                    inspected. Must be between 1 and 64 (both inclusive).
                ;
                ; Output
                ;   C              - Set to 1 if a match was found, otherwise 0
                ;   QuestItemIndex - Holds the index of the item that matched, or $ff if no match was found.
                ;
78d5: ce e1 78  hasQuestItmBfr  DEC QuestItemIndex   ;     Subtract 1 from QuestItemIndex
78d8: 10 d6                     BPL loc_78b0         ; Repeat while (QuestItemIndex >= 0)
78da: 18                        CLC                  ; Set C = 0                (no match found)
78db: 60                        RTS                  ; Return to caller
78dc: 38        contItmFndRts   SEC                  ; Set C = 1                (found a match, index in QuestItemIndex)
78dd: 60                        RTS                  ; Return to caller

                ;
                ; Data starts here [$78de to $9fff ($2722 / 10,018 bytes)]
                ;

78de: 00        ItemRoll        .BYTE $00            ; selectReward: Assigned the random byte used to determine the
                                                     ;     item chosen.
78df: 00        ModuleStatusPg  .BYTE $00            ; The number of the status page added when the module was
                                                     ;     initialized
78e0: 00        QuestItemId     .BYTE $00            ; (hasQuestItmBfr param) Quest item ID value to match to item
                                                     ;     attribute byte 1
78e1: 00        QuestItemIndex  .BYTE $00            ; (hasQuestItmBfr param) The starting item index. Only items with
                                                     ;     an index less than this value will be inspected. Must be
                                                     ;     between 1 and 64 (both inclusive).
                                                     ; (hasQuestItm/hasQuestItmBfr output) Index at which the quest
                                                     ;     item was found or $ff if not found.
78e2: 00        NumStaffFlags   .BYTE $00            ; (temp) lostQuestItem: Used to count number of staff piece quest
                                                     ;     completion flags set. Note this is not initialized in the
                                                     ;     sub itself, and thus may only be valid for the first call
                                                     ;     to the sub after the module is loaded.
78e3: 00        NumStaffPieces  .BYTE $00            ; (temp) lostQuestItem: Used to count number of staff pieces in
                                                     ;     inventory. Note this is not initialized in the sub itself,
                                                     ;     and thus may only be valid for the first call to the sub
                                                     ;     after the module is loaded.
78e4: 00        Num             .BYTE $00            ; (temp) lostQuestItem: Loop control var
78e5: 00        StaffQuestBit   .BYTE $00            ; (temp) lostQuestItem: Holds quest bit index to test for staff
                                                     ;     piece loop

78e6: 10 28 00  CrdTheStar      .BYTE $10,$28,$00                      ; .(.
78e9: 00 00 16 54 68 65 20 53   .BYTE $00,$00,$16,$54,$68,$65,$20,$53  ; ...The S
78f1: 74 61 72 20 28 63 61 72   .BYTE $74,$61,$72,$20,$28,$63,$61,$72  ; tar (car
78f9: 64 29 00 88 ff 44 01 01   .BYTE $64,$29,$00,$88,$ff,$44,$01,$01  ; d)...D..
7901: 00 00 00 00 81 be 00 01   .BYTE $00,$00,$00,$00,$81,$be,$00,$01  ; ........
7909: 00 19 00 00 01            .BYTE $00,$19,$00,$00,$01              ; .....

790e: 10 48 00  CrdTheFool      .BYTE $10,$48,$00                      ; .H.
7911: 00 00 16 54 68 65 20 46   .BYTE $00,$00,$16,$54,$68,$65,$20,$46  ; ...The F
7919: 6f 6f 6c 20 28 63 61 72   .BYTE $6f,$6f,$6c,$20,$28,$63,$61,$72  ; ool (car
7921: 64 29 00 88 ff c4 01 d2   .BYTE $64,$29,$00,$88,$ff,$c4,$01,$d2  ; d)......
7929: 02 0d f0 00 91 84 00 01   .BYTE $02,$0d,$f0,$00,$91,$84,$00,$01  ; ........
7931: 00 01 00 88 ff 44 01 01   .BYTE $00,$01,$00,$88,$ff,$44,$01,$01  ; .....D..
7939: 00 00 00 00 81 84 00 01   .BYTE $00,$00,$00,$00,$81,$84,$00,$01  ; ........
7941: 00 01 00 ec 00 44 4c 75   .BYTE $00,$01,$00,$ec,$00,$44,$4c,$75  ; .....DLu
7949: 63 6b 00 00 00 00 00 00   .BYTE $63,$6b,$00,$00,$00,$00,$00,$00  ; ck......
7951: 00 00 00 00 01            .BYTE $00,$00,$00,$00,$01              ; .....

7956: 10 2e 00  CrdHeirophant   .BYTE $10,$2e,$00                      ; ...
7959: 00 00 1c 54 68 65 20 48   .BYTE $00,$00,$1c,$54,$68,$65,$20,$48  ; ...The H
7961: 65 69 72 6f 70 68 61 6e   .BYTE $65,$69,$72,$6f,$70,$68,$61,$6e  ; eirophan
7969: 74 20 28 63 61 72 64 29   .BYTE $74,$20,$28,$63,$61,$72,$64,$29  ; t (card)
7971: 00 88 ff 44 01 01 00 00   .BYTE $00,$88,$ff,$44,$01,$01,$00,$00  ; ...D....
7979: 00 00 01 20 00 01 00 0f   .BYTE $00,$00,$01,$20,$00,$01,$00,$0f  ; ... ....
7981: 00 00 01                  .BYTE $00,$00,$01                      ; ...

7984: 10 25 00  CrdDeath        .BYTE $10,$25,$00                      ; .%.
7987: 00 00 13 44 65 61 74 68   .BYTE $00,$00,$13,$44,$65,$61,$74,$68  ; ...Death
798f: 20 28 63 61 72 64 29 00   .BYTE $20,$28,$63,$61,$72,$64,$29,$00  ;  (card).
7997: 88 ff 44 01 01 00 00 00   .BYTE $88,$ff,$44,$01,$01,$00,$00,$00  ; ..D.....
799f: 00 02 dd 00 02 08 f8 00   .BYTE $00,$02,$dd,$00,$02,$08,$f8,$00  ; ........
79a7: 00 01                     .BYTE $00,$01                          ; ..

79a9: 10 24 00  CrdAceOfCups    .BYTE $10,$24,$00                      ; .$.
79ac: 00 00 12 41 63 65 20 6f   .BYTE $00,$00,$12,$41,$63,$65,$20,$6f  ; ...Ace o
79b4: 66 20 43 75 70 73 00 88   .BYTE $66,$20,$43,$75,$70,$73,$00,$88  ; f Cups..
79bc: ff 44 01 01 00 00 00 00   .BYTE $ff,$44,$01,$01,$00,$00,$00,$00  ; .D......
79c4: d1 c2 00 10 01 8f 00 00   .BYTE $d1,$c2,$00,$10,$01,$8f,$00,$00  ; ........
79cc: 01                        .BYTE $01                              ; .

79cd: 10 2b 00  CrdTheChariot   .BYTE $10,$2b,$00                      ; .+.
79d0: 00 00 19 54 68 65 20 43   .BYTE $00,$00,$19,$54,$68,$65,$20,$43  ; ...The C
79d8: 68 61 72 69 6f 74 20 28   .BYTE $68,$61,$72,$69,$6f,$74,$20,$28  ; hariot (
79e0: 63 61 72 64 29 00 88 ff   .BYTE $63,$61,$72,$64,$29,$00,$88,$ff  ; card)...
79e8: 44 01 01 00 00 00 00 81   .BYTE $44,$01,$01,$00,$00,$00,$00,$81  ; D.......
79f0: 72 00 01 00 01 00 00 01   .BYTE $72,$00,$01,$00,$01,$00,$00,$01  ; r.......

79f8: 10 28 00  CrdStrength     .BYTE $10,$28,$00                      ; .(.
79fb: 00 00 16 53 74 72 65 6e   .BYTE $00,$00,$16,$53,$74,$72,$65,$6e  ; ...Stren
7a03: 67 74 68 20 28 63 61 72   .BYTE $67,$74,$68,$20,$28,$63,$61,$72  ; gth (car
7a0b: 64 29 00 88 ff 44 01 01   .BYTE $64,$29,$00,$88,$ff,$44,$01,$01  ; d)...D..
7a13: 00 00 00 00 81 5a 00 01   .BYTE $00,$00,$00,$00,$81,$5a,$00,$01  ; .....Z..
7a1b: 00 01 00 00 01            .BYTE $00,$01,$00,$00,$01              ; .....

7a20: 10 35 00  CrdAceOfWands   .BYTE $10,$35,$00                      ; .5.
7a23: 00 00 13 41 63 65 20 6f   .BYTE $00,$00,$13,$41,$63,$65,$20,$6f  ; ...Ace o
7a2b: 66 20 57 61 6e 64 73 00   .BYTE $66,$20,$57,$61,$6e,$64,$73,$00  ; f Wands.
7a33: 88 ff 44 01 01 00 00 00   .BYTE $88,$ff,$44,$01,$01,$00,$00,$00  ; ..D.....
7a3b: 00 01 9b 00 01 00 ff 00   .BYTE $00,$01,$9b,$00,$01,$00,$ff,$00  ; ........
7a43: 88 ff 44 01 01 00 00 00   .BYTE $88,$ff,$44,$01,$01,$00,$00,$00  ; ..D.....
7a4b: 00 01 4f 00 07 08 00 00   .BYTE $00,$01,$4f,$00,$07,$08,$00,$00  ; ..O.....
7a53: 00 01                     .BYTE $00,$01                          ; ..

7a55: 10 2a 00  CrdTemperance   .BYTE $10,$2a,$00                      ; .*.
7a58: 00 00 18 54 65 6d 70 65   .BYTE $00,$00,$18,$54,$65,$6d,$70,$65  ; ...Tempe
7a60: 72 61 6e 63 65 20 28 63   .BYTE $72,$61,$6e,$63,$65,$20,$28,$63  ; rance (c
7a68: 61 72 64 29 00 88 ff 44   .BYTE $61,$72,$64,$29,$00,$88,$ff,$44  ; ard)...D
7a70: 01 01 00 00 00 00 02 96   .BYTE $01,$01,$00,$00,$00,$00,$02,$96  ; ........
7a78: 00 01 00 00 00 00 01      .BYTE $00,$01,$00,$00,$00,$00,$01      ; .......

7a7f: 10 46 00  CrdKingOfWands  .BYTE $10,$46,$00                      ; .F.
7a82: 00 00 14 4b 69 6e 67 20   .BYTE $00,$00,$14,$4b,$69,$6e,$67,$20  ; ...King
7a8a: 6f 66 20 57 61 6e 64 73   .BYTE $6f,$66,$20,$57,$61,$6e,$64,$73  ; of Wands
7a92: 00 88 ff c4 01 b9 00 19   .BYTE $00,$88,$ff,$c4,$01,$b9,$00,$19  ; ........
7a9a: 11 00 01 aa 00 01 00 00   .BYTE $11,$00,$01,$aa,$00,$01,$00,$00  ; ........
7aa2: 00 88 00 44 01 01 00 00   .BYTE $00,$88,$00,$44,$01,$01,$00,$00  ; ...D....
7aaa: 00 00 01 aa 00 01 00 80   .BYTE $00,$00,$01,$aa,$00,$01,$00,$80  ; ........
7ab2: 00 ec 00 44 46 69 72 65   .BYTE $00,$ec,$00,$44,$46,$69,$72,$65  ; ...DFire
7aba: 20 49 6e 76 75 6c 6e 2e   .BYTE $20,$49,$6e,$76,$75,$6c,$6e,$2e  ;  Invuln.
7ac2: 00 00 01                  .BYTE $00,$00,$01                      ; ...

7ac5: 10 3c 00  CrdPageOfCups   .BYTE $10,$3c,$00                      ; .<.
7ac8: 00 00 1a 50 61 67 65 20   .BYTE $00,$00,$1a,$50,$61,$67,$65,$20  ; ...Page
7ad0: 6f 66 20 43 75 70 73 20   .BYTE $6f,$66,$20,$43,$75,$70,$73,$20  ; of Cups
7ad8: 28 63 61 72 64 29 00 88   .BYTE $28,$63,$61,$72,$64,$29,$00,$88  ; (card)..
7ae0: ff 44 01 01 00 00 00 00   .BYTE $ff,$44,$01,$01,$00,$00,$00,$00  ; .D......
7ae8: 01 99 00 02 01 ff 00 88   .BYTE $01,$99,$00,$02,$01,$ff,$00,$88  ; ........
7af0: ff 44 01 01 00 00 00 00   .BYTE $ff,$44,$01,$01,$00,$00,$00,$00  ; .D......
7af8: 02 4d 00 07 08 00 00 00   .BYTE $02,$4d,$00,$07,$08,$00,$00,$00  ; .M......
7b00: 01                        .BYTE $01                              ; .

7b01: 10 29 00  CrdAcePentacls  .BYTE $10,$29,$00                      ; .).
7b04: 00 00 17 41 63 65 20 6f   .BYTE $00,$00,$17,$41,$63,$65,$20,$6f  ; ...Ace o
7b0c: 66 20 50 65 6e 74 61 63   .BYTE $66,$20,$50,$65,$6e,$74,$61,$63  ; f Pentac
7b14: 6c 65 73 00 88 ff 44 01   .BYTE $6c,$65,$73,$00,$88,$ff,$44,$01  ; les...D.
7b1c: 01 00 00 00 00 82 b1 00   .BYTE $01,$00,$00,$00,$00,$82,$b1,$00  ; ........
7b24: 01 00 64 00 00 01         .BYTE $01,$00,$64,$00,$00,$01          ; ..d...

7b2a: 10 4e 00  CrdHighPrstess  .BYTE $10,$4e,$00                      ; .N.
7b2d: 00 00 1c 48 69 67 68 20   .BYTE $00,$00,$1c,$48,$69,$67,$68,$20  ; ...High
7b35: 50 72 69 65 73 74 65 73   .BYTE $50,$72,$69,$65,$73,$74,$65,$73  ; Priestes
7b3d: 73 20 28 63 61 72 64 29   .BYTE $73,$20,$28,$63,$61,$72,$64,$29  ; s (card)
7b45: 00 88 ff c4 01 f5 00 99   .BYTE $00,$88,$ff,$c4,$01,$f5,$00,$99  ; ........
7b4d: 64 00 91 a6 00 0b 01 06   .BYTE $64,$00,$91,$a6,$00,$0b,$01,$06  ; d.......
7b55: 00 88 00 44 01 01 00 00   .BYTE $00,$88,$00,$44,$01,$01,$00,$00  ; ...D....
7b5d: 00 00 81 a6 00 0b 01 06   .BYTE $00,$00,$81,$a6,$00,$0b,$01,$06  ; ........
7b65: 00 ec 00 44 50 72 6f 74   .BYTE $00,$ec,$00,$44,$50,$72,$6f,$74  ; ...DProt
7b6d: 65 63 74 69 6f 6e 00 00   .BYTE $65,$63,$74,$69,$6f,$6e,$00,$00  ; ection..
7b75: 00 00 01                  .BYTE $00,$00,$01                      ; ...

7b78: 08 21 00  ColdWand        .BYTE $08,$21,$00                      ; .!.
7b7b: 00 00 10 43 6f 6c 64 20   .BYTE $00,$00,$10,$43,$6f,$6c,$64,$20  ; ...Cold
7b83: 57 61 6e 64 00 88 ff 44   .BYTE $57,$61,$6e,$64,$00,$88,$ff,$44  ; Wand...D
7b8b: 01 01 00 00 00 00 01 e7   .BYTE $01,$01,$00,$00,$00,$00,$01,$e7  ; ........
7b93: 00 02 01 66 00 00         .BYTE $00,$02,$01,$66,$00,$00          ; ...f..

7b99: 08 21 00  FireWand        .BYTE $08,$21,$00                      ; .!.
7b9c: 00 00 10 46 69 72 65 20   .BYTE $00,$00,$10,$46,$69,$72,$65,$20  ; ...Fire
7ba4: 57 61 6e 64 00 88 ff 44   .BYTE $57,$61,$6e,$64,$00,$88,$ff,$44  ; Wand...D
7bac: 01 01 00 00 00 00 01 e1   .BYTE $01,$01,$00,$00,$00,$00,$01,$e1  ; ........
7bb4: 00 02 07 66 00 00         .BYTE $00,$02,$07,$66,$00,$00          ; ...f..

7bba: 08 26 00  ParalysisWand   .BYTE $08,$26,$00                      ; .&.
7bbd: 00 00 15 50 61 72 61 6c   .BYTE $00,$00,$15,$50,$61,$72,$61,$6c  ; ...Paral
7bc5: 79 73 69 73 20 57 61 6e   .BYTE $79,$73,$69,$73,$20,$57,$61,$6e  ; ysis Wan
7bcd: 64 00 88 ff 44 01 01 00   .BYTE $64,$00,$88,$ff,$44,$01,$01,$00  ; d...D...
7bd5: 00 00 00 01 f0 00 01 00   .BYTE $00,$00,$00,$01,$f0,$00,$01,$00  ; ........
7bdd: 05 00 00                  .BYTE $05,$00,$00                      ; ...

7be0: 10 2c 00  EyeVulnerablty  .BYTE $10,$2c,$00                      ; .,.
7be3: 00 01 1a 45 79 65 20 6f   .BYTE $00,$01,$1a,$45,$79,$65,$20,$6f  ; ...Eye o
7beb: 66 20 56 75 6c 6e 65 72   .BYTE $66,$20,$56,$75,$6c,$6e,$65,$72  ; f Vulner
7bf3: 61 62 69 6c 74 79 00 88   .BYTE $61,$62,$69,$6c,$74,$79,$00,$88  ; abilty..
7bfb: ff 44 01 01 00 00 00 00   .BYTE $ff,$44,$01,$01,$00,$00,$00,$00  ; .D......
7c03: 01 f0 00 01 00 09 00 00   .BYTE $01,$f0,$00,$01,$00,$09,$00,$00  ; ........
7c0b: 03                        .BYTE $03                              ; .

7c0c: 08 42 00  LightWand       .BYTE $08,$42,$00                      ; .B.
7c0f: 00 00 11 4c 69 67 68 74   .BYTE $00,$00,$11,$4c,$69,$67,$68,$74  ; ...Light
7c17: 20 57 61 6e 64 00 88 ff   .BYTE $20,$57,$61,$6e,$64,$00,$88,$ff  ;  Wand...
7c1f: c4 01 d2 02 ad de 00 91   .BYTE $c4,$01,$d2,$02,$ad,$de,$00,$91  ; ........
7c27: 90 00 01 00 01 00 ec 00   .BYTE $90,$00,$01,$00,$01,$00,$ec,$00  ; ........
7c2f: 44 4c 69 67 68 74 00 00   .BYTE $44,$4c,$69,$67,$68,$74,$00,$00  ; DLight..
7c37: 00 00 00 00 00 00 88 ff   .BYTE $00,$00,$00,$00,$00,$00,$88,$ff  ; ........
7c3f: 44 01 01 00 00 00 00 81   .BYTE $44,$01,$01,$00,$00,$00,$00,$81  ; D.......
7c47: 90 00 01 00 01 00 00      .BYTE $90,$00,$01,$00,$01,$00,$00      ; .......

7c4e: 08 24 00  HealingWand     .BYTE $08,$24,$00                      ; .$.
7c51: 00 00 13 48 65 61 6c 69   .BYTE $00,$00,$13,$48,$65,$61,$6c,$69  ; ...Heali
7c59: 6e 67 20 57 61 6e 64 00   .BYTE $6e,$67,$20,$57,$61,$6e,$64,$00  ; ng Wand.
7c61: 88 ff 44 01 01 00 00 00   .BYTE $88,$ff,$44,$01,$01,$00,$00,$00  ; ..D.....
7c69: 00 82 45 00 01 00 32 00   .BYTE $00,$82,$45,$00,$01,$00,$32,$00  ; ..E...2.
7c71: 00                        .BYTE $00                              ; .

7c72: 10 4a 00  ScrlFrostblade  .BYTE $10,$4a,$00                      ; .J.
7c75: 00 00 18 46 72 6f 73 74   .BYTE $00,$00,$18,$46,$72,$6f,$73,$74  ; ...Frost
7c7d: 62 6c 61 64 65 20 53 63   .BYTE $62,$6c,$61,$64,$65,$20,$53,$63  ; blade Sc
7c85: 72 6f 6c 6c 00 87 ff c4   .BYTE $72,$6f,$6c,$6c,$00,$87,$ff,$c4  ; roll....
7c8d: 01 3d 00 00 00 00 01 dc   .BYTE $01,$3d,$00,$00,$00,$00,$01,$dc  ; .=......
7c95: 00 01 00 00 00 84 00 44   .BYTE $00,$01,$00,$00,$00,$84,$00,$44  ; .......D
7c9d: 01 01 00 00 00 00 01 dc   .BYTE $01,$01,$00,$00,$00,$00,$01,$dc  ; ........
7ca5: 00 01 00 24 00 ec 00 44   .BYTE $00,$01,$00,$24,$00,$ec,$00,$44  ; ...$...D
7cad: 46 72 6f 73 74 62 6c 61   .BYTE $46,$72,$6f,$73,$74,$62,$6c,$61  ; Frostbla
7cb5: 64 65 00 00 00 00 01      .BYTE $64,$65,$00,$00,$00,$00,$01      ; de.....

7cbc: 10 49 00  ScrlFireblade   .BYTE $10,$49,$00                      ; .I.
7cbf: 00 00 17 46 69 72 65 62   .BYTE $00,$00,$17,$46,$69,$72,$65,$62  ; ...Fireb
7cc7: 6c 61 64 65 20 53 63 72   .BYTE $6c,$61,$64,$65,$20,$53,$63,$72  ; lade Scr
7ccf: 6f 6c 6c 00 87 ff c4 01   .BYTE $6f,$6c,$6c,$00,$87,$ff,$c4,$01  ; oll.....
7cd7: 3d 00 00 00 00 01 d5 00   .BYTE $3d,$00,$00,$00,$00,$01,$d5,$00  ; =.......
7cdf: 01 00 00 00 84 00 44 01   .BYTE $01,$00,$00,$00,$84,$00,$44,$01  ; ......D.
7ce7: 01 00 00 00 00 01 d5 00   .BYTE $01,$00,$00,$00,$00,$01,$d5,$00  ; ........
7cef: 01 00 24 00 ec 00 44 46   .BYTE $01,$00,$24,$00,$ec,$00,$44,$46  ; ..$...DF
7cf7: 69 72 65 62 6c 61 64 65   .BYTE $69,$72,$65,$62,$6c,$61,$64,$65  ; ireblade
7cff: 00 00 00 00 00 01         .BYTE $00,$00,$00,$00,$00,$01          ; ......

7d05: 10 45 00  ScrlClout       .BYTE $10,$45,$00                      ; .E.
7d08: 00 00 13 43 6c 6f 75 74   .BYTE $00,$00,$13,$43,$6c,$6f,$75,$74  ; ...Clout
7d10: 20 53 63 72 6f 6c 6c 00   .BYTE $20,$53,$63,$72,$6f,$6c,$6c,$00  ;  Scroll.
7d18: 87 ff c4 01 3e 00 00 00   .BYTE $87,$ff,$c4,$01,$3e,$00,$00,$00  ; ....>...
7d20: 00 01 d2 00 01 00 00 00   .BYTE $00,$01,$d2,$00,$01,$00,$00,$00  ; ........
7d28: 84 00 44 01 01 00 00 00   .BYTE $84,$00,$44,$01,$01,$00,$00,$00  ; ..D.....
7d30: 00 01 d2 00 01 00 24 00   .BYTE $00,$01,$d2,$00,$01,$00,$24,$00  ; ......$.
7d38: ec 00 44 43 6c 6f 75 74   .BYTE $ec,$00,$44,$43,$6c,$6f,$75,$74  ; ..DClout
7d40: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ; ........
7d48: 00 01                     .BYTE $00,$01                          ; ..

7d4a: 18 18 00  ScrlRenew       .BYTE $18,$18,$00                      ; ...
7d4d: 00 00 13 52 65 6e 65 77   .BYTE $00,$00,$13,$52,$65,$6e,$65,$77  ; ...Renew
7d55: 20 53 63 72 6f 6c 6c 00   .BYTE $20,$53,$63,$72,$6f,$6c,$6c,$00  ;  Scroll.
7d5d: 00 00 01 01 10            .BYTE $00,$00,$01,$01,$10              ; .....

7d62: 18 1f 00  ScrlRemovCurse  .BYTE $18,$1f,$00                      ; ...
7d65: 00 00 1a 52 65 6d 6f 76   .BYTE $00,$00,$1a,$52,$65,$6d,$6f,$76  ; ...Remov
7d6d: 65 20 43 75 72 73 65 20   .BYTE $65,$20,$43,$75,$72,$73,$65,$20  ; e Curse
7d75: 53 63 72 6f 6c 6c 00 00   .BYTE $53,$63,$72,$6f,$6c,$6c,$00,$00  ; Scroll..
7d7d: 83 01 06 08               .BYTE $83,$01,$06,$08                  ; ....

7d81: 10 6a 00  ScrlWizardEye   .BYTE $10,$6a,$00                      ; .j.
7d84: 00 00 18 57 69 7a 61 72   .BYTE $00,$00,$18,$57,$69,$7a,$61,$72  ; ...Wizar
7d8c: 64 20 45 79 65 20 53 63   .BYTE $64,$20,$45,$79,$65,$20,$53,$63  ; d Eye Sc
7d94: 72 6f 6c 6c 00 84 ff c4   .BYTE $72,$6f,$6c,$6c,$00,$84,$ff,$c4  ; roll....
7d9c: 01 f1 00 0d f0 00 91 90   .BYTE $01,$f1,$00,$0d,$f0,$00,$91,$90  ; ........
7da4: 00 01 00 01 00 84 00 44   .BYTE $00,$01,$00,$01,$00,$84,$00,$44  ; .......D
7dac: 01 01 00 00 00 00 81 90   .BYTE $01,$01,$00,$00,$00,$00,$81,$90  ; ........
7db4: 00 01 00 01 00 84 00 44   .BYTE $00,$01,$00,$01,$00,$84,$00,$44  ; .......D
7dbc: 01 01 00 00 00 00 81 8b   .BYTE $01,$01,$00,$00,$00,$00,$81,$8b  ; ........
7dc4: 00 01 00 01 00 84 ff c4   .BYTE $00,$01,$00,$01,$00,$84,$ff,$c4  ; ........
7dcc: 01 f1 00 0d f0 00 91 8b   .BYTE $01,$f1,$00,$0d,$f0,$00,$91,$8b  ; ........
7dd4: 00 01 00 01 00 ec 00 04   .BYTE $00,$01,$00,$01,$00,$ec,$00,$04  ; ........
7ddc: 57 69 7a 61 72 64 20 45   .BYTE $57,$69,$7a,$61,$72,$64,$20,$45  ; Wizard E
7de4: 79 65 00 00 00 00 01      .BYTE $79,$65,$00,$00,$00,$00,$01      ; ye.....

7deb: 10 21 00  RubyEye         .BYTE $10,$21,$00                      ; .!.
7dee: 00 00 0f 52 75 62 79 20   .BYTE $00,$00,$0f,$52,$75,$62,$79,$20  ; ...Ruby
7df6: 45 79 65 00 88 ff 44 01   .BYTE $45,$79,$65,$00,$88,$ff,$44,$01  ; Eye...D.
7dfe: 01 00 00 00 00 01 e1 00   .BYTE $01,$00,$00,$00,$00,$01,$e1,$00  ; ........
7e06: 02 07 f6 00 00 03         .BYTE $02,$07,$f6,$00,$00,$03          ; ......

7e0c: 10 24 00  EmeraldEye      .BYTE $10,$24,$00                      ; .$.
7e0f: 00 00 12 45 6d 65 72 61   .BYTE $00,$00,$12,$45,$6d,$65,$72,$61  ; ...Emera
7e17: 6c 64 20 45 79 65 00 88   .BYTE $6c,$64,$20,$45,$79,$65,$00,$88  ; ld Eye..
7e1f: ff 44 01 01 00 00 00 00   .BYTE $ff,$44,$01,$01,$00,$00,$00,$00  ; .D......
7e27: 01 e2 00 02 06 f6 00 00   .BYTE $01,$e2,$00,$02,$06,$f6,$00,$00  ; ........
7e2f: 03                        .BYTE $03                              ; .

7e30: 10 25 00  SapphireEye     .BYTE $10,$25,$00                      ; .%.
7e33: 00 00 13 53 61 70 70 68   .BYTE $00,$00,$13,$53,$61,$70,$70,$68  ; ...Sapph
7e3b: 69 72 65 20 45 79 65 00   .BYTE $69,$72,$65,$20,$45,$79,$65,$00  ; ire Eye.
7e43: 88 ff 44 01 01 00 00 00   .BYTE $88,$ff,$44,$01,$01,$00,$00,$00  ; ..D.....
7e4b: 00 01 e0 00 02 08 f6 00   .BYTE $00,$01,$e0,$00,$02,$08,$f6,$00  ; ........
7e53: 00 03                     .BYTE $00,$03                          ; ..

7e55: 10 22 00  AmberEye        .BYTE $10,$22,$00                      ; .".
7e58: 00 00 10 41 6d 62 65 72   .BYTE $00,$00,$10,$41,$6d,$62,$65,$72  ; ...Amber
7e60: 20 45 79 65 00 88 ff 44   .BYTE $20,$45,$79,$65,$00,$88,$ff,$44  ;  Eye...D
7e68: 01 01 00 00 00 00 01 df   .BYTE $01,$01,$00,$00,$00,$00,$01,$df  ; ........
7e70: 00 02 09 f6 00 00 03      .BYTE $00,$02,$09,$f6,$00,$00,$03      ; .......

7e77: 10 45 00  WizardsEye      .BYTE $10,$45,$00                      ; .E.
7e7a: 00 00 13 57 69 7a 61 72   .BYTE $00,$00,$13,$57,$69,$7a,$61,$72  ; ...Wizar
7e82: 64 27 73 20 45 79 65 00   .BYTE $64,$27,$73,$20,$45,$79,$65,$00  ; d's Eye.
7e8a: 84 ff c4 01 75 01 5c 00   .BYTE $84,$ff,$c4,$01,$75,$01,$5c,$00  ; ....u.\.
7e92: 00 91 8b 00 02 05 01 00   .BYTE $00,$91,$8b,$00,$02,$05,$01,$00  ; ........
7e9a: 84 00 44 01 01 00 00 00   .BYTE $84,$00,$44,$01,$01,$00,$00,$00  ; ..D.....
7ea2: 00 81 8b 00 02 05 01 00   .BYTE $00,$81,$8b,$00,$02,$05,$01,$00  ; ........
7eaa: ec 00 44 57 69 7a 61 72   .BYTE $ec,$00,$44,$57,$69,$7a,$61,$72  ; ..DWizar
7eb2: 64 20 45 79 65 00 00 00   .BYTE $64,$20,$45,$79,$65,$00,$00,$00  ; d Eye...
7eba: 00 03                     .BYTE $00,$03                          ; ..

7ebc: 10 25 00  HypnoticEye     .BYTE $10,$25,$00                      ; .%.
7ebf: 00 00 13 48 79 70 6e 6f   .BYTE $00,$00,$13,$48,$79,$70,$6e,$6f  ; ...Hypno
7ec7: 74 69 63 20 45 79 65 00   .BYTE $74,$69,$63,$20,$45,$79,$65,$00  ; tic Eye.
7ecf: 88 ff 44 01 01 00 00 00   .BYTE $88,$ff,$44,$01,$01,$00,$00,$00  ; ..D.....
7ed7: 00 01 f0 00 01 00 03 00   .BYTE $00,$01,$f0,$00,$01,$00,$03,$00  ; ........
7edf: 00 03                     .BYTE $00,$03                          ; ..

7ee1: 10 2a 00  TomeKnowledge   .BYTE $10,$2a,$00                      ; .*.
7ee4: 00 00 18 54 6f 6d 65 20   .BYTE $00,$00,$18,$54,$6f,$6d,$65,$20  ; ...Tome
7eec: 6f 66 20 4b 6e 6f 77 6c   .BYTE $6f,$66,$20,$4b,$6e,$6f,$77,$6c  ; of Knowl
7ef4: 65 64 67 65 00 88 ff 44   .BYTE $65,$64,$67,$65,$00,$88,$ff,$44  ; edge...D
7efc: 01 01 00 00 00 00 81 62   .BYTE $01,$01,$00,$00,$00,$00,$81,$62  ; .......b
7f04: 00 01 00 01 00 00 01      .BYTE $00,$01,$00,$01,$00,$00,$01      ; .......

7f0b: 10 2e 00  TomeUndrstndng  .BYTE $10,$2e,$00                      ; ...
7f0e: 00 00 1c 54 6f 6d 65 20   .BYTE $00,$00,$1c,$54,$6f,$6d,$65,$20  ; ...Tome
7f16: 6f 66 20 55 6e 64 65 72   .BYTE $6f,$66,$20,$55,$6e,$64,$65,$72  ; of Under
7f1e: 73 74 61 6e 64 69 6e 67   .BYTE $73,$74,$61,$6e,$64,$69,$6e,$67  ; standing
7f26: 00 88 ff 44 01 01 00 00   .BYTE $00,$88,$ff,$44,$01,$01,$00,$00  ; ...D....
7f2e: 00 00 81 6a 00 01 00 01   .BYTE $00,$00,$81,$6a,$00,$01,$00,$01  ; ...j....
7f36: 00 00 01                  .BYTE $00,$00,$01                      ; ...

7f39: 10 2b 00  TomeLeadership  .BYTE $10,$2b,$00                      ; .+.
7f3c: 00 00 19 54 6f 6d 65 20   .BYTE $00,$00,$19,$54,$6f,$6d,$65,$20  ; ...Tome
7f44: 6f 66 20 4c 65 61 64 65   .BYTE $6f,$66,$20,$4c,$65,$61,$64,$65  ; of Leade
7f4c: 72 73 68 69 70 00 88 ff   .BYTE $72,$73,$68,$69,$70,$00,$88,$ff  ; rship...
7f54: 44 01 01 00 00 00 00 81   .BYTE $44,$01,$01,$00,$00,$00,$00,$81  ; D.......
7f5c: 52 00 01 00 01 00 00 01   .BYTE $52,$00,$01,$00,$01,$00,$00,$01  ; R.......

7f64: 10 24 00  BronzeHorn      .BYTE $10,$24,$00                      ; .$.
7f67: 00 00 12 42 72 6f 6e 7a   .BYTE $00,$00,$12,$42,$72,$6f,$6e,$7a  ; ...Bronz
7f6f: 65 20 48 6f 72 6e 00 88   .BYTE $65,$20,$48,$6f,$72,$6e,$00,$88  ; e Horn..
7f77: ff 44 01 01 00 00 00 00   .BYTE $ff,$44,$01,$01,$00,$00,$00,$00  ; .D......
7f7f: 81 bb 00 02 01 05 00 00   .BYTE $81,$bb,$00,$02,$01,$05,$00,$00  ; ........
7f87: 07                        .BYTE $07                              ; .

7f88: 10 24 00  SilverHorn      .BYTE $10,$24,$00                      ; .$.
7f8b: 00 00 12 53 69 6c 76 65   .BYTE $00,$00,$12,$53,$69,$6c,$76,$65  ; ...Silve
7f93: 72 20 48 6f 72 6e 00 88   .BYTE $72,$20,$48,$6f,$72,$6e,$00,$88  ; r Horn..
7f9b: ff 44 01 01 00 00 00 00   .BYTE $ff,$44,$01,$01,$00,$00,$00,$00  ; .D......
7fa3: 01 e5 00 02 03 f4 00 00   .BYTE $01,$e5,$00,$02,$03,$f4,$00,$00  ; ........
7fab: 07                        .BYTE $07                              ; .

7fac: 10 22 00  GoldHorn1       .BYTE $10,$22,$00                      ; .".
7faf: 00 00 10 47 6f 6c 64 20   .BYTE $00,$00,$10,$47,$6f,$6c,$64,$20  ; ...Gold
7fb7: 48 6f 72 6e 00 88 ff 44   .BYTE $48,$6f,$72,$6e,$00,$88,$ff,$44  ; Horn...D
7fbf: 01 01 00 00 00 00 02 45   .BYTE $01,$01,$00,$00,$00,$00,$02,$45  ; .......E
7fc7: 00 01 00 ff 00 00 07      .BYTE $00,$01,$00,$ff,$00,$00,$07      ; .......

7fce: 10 22 00  GoldHorn2       .BYTE $10,$22,$00                      ; .".
7fd1: 00 00 10 47 6f 6c 64 20   .BYTE $00,$00,$10,$47,$6f,$6c,$64,$20  ; ...Gold
7fd9: 48 6f 72 6e 00 88 ff 44   .BYTE $48,$6f,$72,$6e,$00,$88,$ff,$44  ; Horn...D
7fe1: 01 01 00 00 00 00 01 20   .BYTE $01,$01,$00,$00,$00,$00,$01,$20  ; .......
7fe9: 00 01 00 46 00 00 01      .BYTE $00,$01,$00,$46,$00,$00,$01      ; ...F...

7ff0: 06 4b 00  PtnFleetness    .BYTE $06,$4b,$00                      ; .K.
7ff3: 00 01 1a 50 6f 74 69 6f   .BYTE $00,$01,$1a,$50,$6f,$74,$69,$6f  ; ...Potio
7ffb: 6e 20 6f 66 20 46 6c 65   .BYTE $6e,$20,$6f,$66,$20,$46,$6c,$65  ; n of Fle
8003: 65 74 6e 65 73 73 00 84   .BYTE $65,$74,$6e,$65,$73,$73,$00,$84  ; etness..
800b: ff c4 01 e0 01 ed fe 00   .BYTE $ff,$c4,$01,$e0,$01,$ed,$fe,$00  ; ........
8013: 91 7b 00 01 00 64 00 84   .BYTE $91,$7b,$00,$01,$00,$64,$00,$84  ; .{...d..
801b: 00 44 01 01 00 ed fe 00   .BYTE $00,$44,$01,$01,$00,$ed,$fe,$00  ; .D......
8023: 81 7b 00 01 00 64 00 ec   .BYTE $81,$7b,$00,$01,$00,$64,$00,$ec  ; .{...d..
802b: 00 44 46 6c 65 65 74 6e   .BYTE $00,$44,$46,$6c,$65,$65,$74,$6e  ; .DFleetn
8033: 65 73 73 00 20 73 6d 00   .BYTE $65,$73,$73,$00,$20,$73,$6d,$00  ; ess. sm.

803b: 06 4a 00  PtnStrength     .BYTE $06,$4a,$00                      ; .J.
803e: 00 01 19 50 6f 74 69 6f   .BYTE $00,$01,$19,$50,$6f,$74,$69,$6f  ; ...Potio
8046: 6e 20 6f 66 20 53 74 72   .BYTE $6e,$20,$6f,$66,$20,$53,$74,$72  ; n of Str
804e: 65 6e 67 74 68 00 84 ff   .BYTE $65,$6e,$67,$74,$68,$00,$84,$ff  ; ength...
8056: c4 01 e0 01 ed fe 00 91   .BYTE $c4,$01,$e0,$01,$ed,$fe,$00,$91  ; ........
805e: 5b 00 01 00 14 00 84 00   .BYTE $5b,$00,$01,$00,$14,$00,$84,$00  ; [.......
8066: 44 01 01 00 ed fe 00 81   .BYTE $44,$01,$01,$00,$ed,$fe,$00,$81  ; D.......
806e: 5b 00 01 00 14 00 ec 00   .BYTE $5b,$00,$01,$00,$14,$00,$ec,$00  ; [.......
8076: 44 53 74 72 65 6e 67 74   .BYTE $44,$53,$74,$72,$65,$6e,$67,$74  ; DStrengt
807e: 68 00 65 20 63 72 00      .BYTE $68,$00,$65,$20,$63,$72,$00      ; h.e cr.

8085: 06 4e 00  PtnIntellignce  .BYTE $06,$4e,$00                      ; .N.
8088: 00 01 1d 50 6f 74 69 6f   .BYTE $00,$01,$1d,$50,$6f,$74,$69,$6f  ; ...Potio
8090: 6e 20 6f 66 20 49 6e 74   .BYTE $6e,$20,$6f,$66,$20,$49,$6e,$74  ; n of Int
8098: 65 6c 6c 69 67 65 6e 63   .BYTE $65,$6c,$6c,$69,$67,$65,$6e,$63  ; elligenc
80a0: 65 00 84 ff c4 01 e0 01   .BYTE $65,$00,$84,$ff,$c4,$01,$e0,$01  ; e.......
80a8: ed fe 00 91 63 00 01 00   .BYTE $ed,$fe,$00,$91,$63,$00,$01,$00  ; ....c...
80b0: 14 00 84 00 44 01 01 00   .BYTE $14,$00,$84,$00,$44,$01,$01,$00  ; ....D...
80b8: ed fe 00 81 63 00 01 00   .BYTE $ed,$fe,$00,$81,$63,$00,$01,$00  ; ....c...
80c0: 14 00 ec 00 44 49 6e 74   .BYTE $14,$00,$ec,$00,$44,$49,$6e,$74  ; ....DInt
80c8: 65 6c 6c 69 67 65 6e 63   .BYTE $65,$6c,$6c,$69,$67,$65,$6e,$63  ; elligenc
80d0: 65 00 00                  .BYTE $65,$00,$00                      ; e..

80d3: 06 4a 00  PtnCharisma     .BYTE $06,$4a,$00                      ; .J.
80d6: 00 01 19 50 6f 74 69 6f   .BYTE $00,$01,$19,$50,$6f,$74,$69,$6f  ; ...Potio
80de: 6e 20 6f 66 20 43 68 61   .BYTE $6e,$20,$6f,$66,$20,$43,$68,$61  ; n of Cha
80e6: 72 69 73 6d 61 00 84 ff   .BYTE $72,$69,$73,$6d,$61,$00,$84,$ff  ; risma...
80ee: c4 01 e0 01 ed fe 00 91   .BYTE $c4,$01,$e0,$01,$ed,$fe,$00,$91  ; ........
80f6: 53 00 01 00 14 00 84 00   .BYTE $53,$00,$01,$00,$14,$00,$84,$00  ; S.......
80fe: 44 01 01 00 ed fe 00 81   .BYTE $44,$01,$01,$00,$ed,$fe,$00,$81  ; D.......
8106: 53 00 01 00 14 00 ec 00   .BYTE $53,$00,$01,$00,$14,$00,$ec,$00  ; S.......
810e: 44 43 68 61 72 69 73 6d   .BYTE $44,$43,$68,$61,$72,$69,$73,$6d  ; DCharism
8116: 61 00 74 6f 20 61 00      .BYTE $61,$00,$74,$6f,$20,$61,$00      ; a.to a.

811d: 06 2b 00  PtnEndurance    .BYTE $06,$2b,$00                      ; .+.
8120: 00 01 1a 50 6f 74 69 6f   .BYTE $00,$01,$1a,$50,$6f,$74,$69,$6f  ; ...Potio
8128: 6e 20 6f 66 20 45 6e 64   .BYTE $6e,$20,$6f,$66,$20,$45,$6e,$64  ; n of End
8130: 75 72 61 6e 63 65 00 84   .BYTE $75,$72,$61,$6e,$63,$65,$00,$84  ; urance..
8138: ff c4 01 e0 01 ed fe 00   .BYTE $ff,$c4,$01,$e0,$01,$ed,$fe,$00  ; ........
8140: 81 9b 00 01 00 40 00 00   .BYTE $81,$9b,$00,$01,$00,$40,$00,$00  ; .....@..

8148: 06 4c 00  PtnInvBlunt     .BYTE $06,$4c,$00                      ; .L.
814b: 00 01 1b 50 6f 74 69 6f   .BYTE $00,$01,$1b,$50,$6f,$74,$69,$6f  ; ...Potio
8153: 6e 20 6f 66 20 49 6e 76   .BYTE $6e,$20,$6f,$66,$20,$49,$6e,$76  ; n of Inv
815b: 2e 20 42 6c 75 6e 74 00   .BYTE $2e,$20,$42,$6c,$75,$6e,$74,$00  ; . Blunt.
8163: 84 ff c4 01 e0 01 ed fe   .BYTE $84,$ff,$c4,$01,$e0,$01,$ed,$fe  ; ........
816b: 00 91 a6 00 01 00 80 00   .BYTE $00,$91,$a6,$00,$01,$00,$80,$00  ; ........
8173: 84 00 44 01 01 00 ed fe   .BYTE $84,$00,$44,$01,$01,$00,$ed,$fe  ; ..D.....
817b: 00 81 a6 00 01 00 80 00   .BYTE $00,$81,$a6,$00,$01,$00,$80,$00  ; ........
8183: ec 00 44 49 6e 76 2e 20   .BYTE $ec,$00,$44,$49,$6e,$76,$2e,$20  ; ..DInv.
818b: 42 6c 75 6e 74 00 2c 20   .BYTE $42,$6c,$75,$6e,$74,$00,$2c,$20  ; Blunt.,
8193: 00                        .BYTE $00                              ; .

8194: 06 4c 00  PtnInvSharp     .BYTE $06,$4c,$00                      ; .L.
8197: 00 01 1b 50 6f 74 69 6f   .BYTE $00,$01,$1b,$50,$6f,$74,$69,$6f  ; ...Potio
819f: 6e 20 6f 66 20 49 6e 76   .BYTE $6e,$20,$6f,$66,$20,$49,$6e,$76  ; n of Inv
81a7: 2e 20 53 68 61 72 70 00   .BYTE $2e,$20,$53,$68,$61,$72,$70,$00  ; . Sharp.
81af: 84 ff c4 01 e0 01 ed fe   .BYTE $84,$ff,$c4,$01,$e0,$01,$ed,$fe  ; ........
81b7: 00 91 a7 00 01 00 80 00   .BYTE $00,$91,$a7,$00,$01,$00,$80,$00  ; ........
81bf: 84 00 44 01 01 00 ed fe   .BYTE $84,$00,$44,$01,$01,$00,$ed,$fe  ; ..D.....
81c7: 00 81 a7 00 01 00 80 00   .BYTE $00,$81,$a7,$00,$01,$00,$80,$00  ; ........
81cf: ec 00 44 49 6e 76 2e 20   .BYTE $ec,$00,$44,$49,$6e,$76,$2e,$20  ; ..DInv.
81d7: 53 68 61 72 70 00 69 6f   .BYTE $53,$68,$61,$72,$70,$00,$69,$6f  ; Sharp.io
81df: 00                        .BYTE $00                              ; .

81e0: 06 4c 00  PtnInvEarth     .BYTE $06,$4c,$00                      ; .L.
81e3: 00 01 1b 50 6f 74 69 6f   .BYTE $00,$01,$1b,$50,$6f,$74,$69,$6f  ; ...Potio
81eb: 6e 20 6f 66 20 49 6e 76   .BYTE $6e,$20,$6f,$66,$20,$49,$6e,$76  ; n of Inv
81f3: 2e 20 45 61 72 74 68 00   .BYTE $2e,$20,$45,$61,$72,$74,$68,$00  ; . Earth.
81fb: 84 ff c4 01 e0 01 ed fe   .BYTE $84,$ff,$c4,$01,$e0,$01,$ed,$fe  ; ........
8203: 00 91 a8 00 01 00 80 00   .BYTE $00,$91,$a8,$00,$01,$00,$80,$00  ; ........
820b: 84 00 44 01 01 00 ed fe   .BYTE $84,$00,$44,$01,$01,$00,$ed,$fe  ; ..D.....
8213: 00 81 a8 00 01 00 80 00   .BYTE $00,$81,$a8,$00,$01,$00,$80,$00  ; ........
821b: ec 00 44 49 6e 76 2e 20   .BYTE $ec,$00,$44,$49,$6e,$76,$2e,$20  ; ..DInv.
8223: 45 61 72 74 68 00 61 6c   .BYTE $45,$61,$72,$74,$68,$00,$61,$6c  ; Earth.al
822b: 00                        .BYTE $00                              ; .

822c: 06 4a 00  PtnInvAir       .BYTE $06,$4a,$00                      ; .J.
822f: 00 01 19 50 6f 74 69 6f   .BYTE $00,$01,$19,$50,$6f,$74,$69,$6f  ; ...Potio
8237: 6e 20 6f 66 20 49 6e 76   .BYTE $6e,$20,$6f,$66,$20,$49,$6e,$76  ; n of Inv
823f: 2e 20 41 69 72 00 84 ff   .BYTE $2e,$20,$41,$69,$72,$00,$84,$ff  ; . Air...
8247: c4 01 e0 01 ed fe 00 91   .BYTE $c4,$01,$e0,$01,$ed,$fe,$00,$91  ; ........
824f: a9 00 01 00 80 00 84 00   .BYTE $a9,$00,$01,$00,$80,$00,$84,$00  ; ........
8257: 44 01 01 00 ed fe 00 81   .BYTE $44,$01,$01,$00,$ed,$fe,$00,$81  ; D.......
825f: a9 00 01 00 80 00 ec 00   .BYTE $a9,$00,$01,$00,$80,$00,$ec,$00  ; ........
8267: 44 49 6e 76 2e 20 41 69   .BYTE $44,$49,$6e,$76,$2e,$20,$41,$69  ; DInv. Ai
826f: 72 00 6c 65 64 20 00      .BYTE $72,$00,$6c,$65,$64,$20,$00      ; r.led .

8276: 06 4b 00  PtnInvFire      .BYTE $06,$4b,$00                      ; .K.
8279: 00 01 1a 50 6f 74 69 6f   .BYTE $00,$01,$1a,$50,$6f,$74,$69,$6f  ; ...Potio
8281: 6e 20 6f 66 20 49 6e 76   .BYTE $6e,$20,$6f,$66,$20,$49,$6e,$76  ; n of Inv
8289: 2e 20 46 69 72 65 00 84   .BYTE $2e,$20,$46,$69,$72,$65,$00,$84  ; . Fire..
8291: ff c4 01 e0 01 ed fe 00   .BYTE $ff,$c4,$01,$e0,$01,$ed,$fe,$00  ; ........
8299: 91 aa 00 01 00 80 00 84   .BYTE $91,$aa,$00,$01,$00,$80,$00,$84  ; ........
82a1: 00 44 01 01 00 ed fe 00   .BYTE $00,$44,$01,$01,$00,$ed,$fe,$00  ; .D......
82a9: 81 aa 00 01 00 80 00 ec   .BYTE $81,$aa,$00,$01,$00,$80,$00,$ec  ; ........
82b1: 00 44 49 6e 76 2e 20 46   .BYTE $00,$44,$49,$6e,$76,$2e,$20,$46  ; .DInv. F
82b9: 69 72 65 00 6c 61 63 00   .BYTE $69,$72,$65,$00,$6c,$61,$63,$00  ; ire.lac.

82c1: 06 4c 00  PtnInvWater     .BYTE $06,$4c,$00                      ; .L.
82c4: 00 01 1b 50 6f 74 69 6f   .BYTE $00,$01,$1b,$50,$6f,$74,$69,$6f  ; ...Potio
82cc: 6e 20 6f 66 20 49 6e 76   .BYTE $6e,$20,$6f,$66,$20,$49,$6e,$76  ; n of Inv
82d4: 2e 20 57 61 74 65 72 00   .BYTE $2e,$20,$57,$61,$74,$65,$72,$00  ; . Water.
82dc: 84 ff c4 01 e0 01 ed fe   .BYTE $84,$ff,$c4,$01,$e0,$01,$ed,$fe  ; ........
82e4: 00 91 ab 00 01 00 80 00   .BYTE $00,$91,$ab,$00,$01,$00,$80,$00  ; ........
82ec: 84 00 44 01 01 00 ed fe   .BYTE $84,$00,$44,$01,$01,$00,$ed,$fe  ; ..D.....
82f4: 00 81 ab c6 01 00 80 00   .BYTE $00,$81,$ab,$c6,$01,$00,$80,$00  ; ........
82fc: ec 00 44 49 6e 76 2e 20   .BYTE $ec,$00,$44,$49,$6e,$76,$2e,$20  ; ..DInv.
8304: 57 61 74 65 72 00 74 20   .BYTE $57,$61,$74,$65,$72,$00,$74,$20  ; Water.t
830c: 00                        .BYTE $00                              ; .

830d: 06 3e 00  PtnRegenration  .BYTE $06,$3e,$00                      ; .>.
8310: 00 01 1d 50 6f 74 69 6f   .BYTE $00,$01,$1d,$50,$6f,$74,$69,$6f  ; ...Potio
8318: 6e 20 6f 66 20 52 65 67   .BYTE $6e,$20,$6f,$66,$20,$52,$65,$67  ; n of Reg
8320: 65 6e 65 72 61 74 69 6f   .BYTE $65,$6e,$65,$72,$61,$74,$69,$6f  ; eneratio
8328: 6e 00 84 ff c4 3c 01 00   .BYTE $6e,$00,$84,$ff,$c4,$3c,$01,$00  ; n....<..
8330: 01 00 00 82 45 00 01 00   .BYTE $01,$00,$00,$82,$45,$00,$01,$00  ; ....E...
8338: 02 00 ec 00 44 52 65 67   .BYTE $02,$00,$ec,$00,$44,$52,$65,$67  ; ....DReg
8340: 65 6e 65 72 61 74 69 6f   .BYTE $65,$6e,$65,$72,$61,$74,$69,$6f  ; eneratio
8348: 6e 00 00                  .BYTE $6e,$00,$00                      ; n..

834b: 06 4d 00  PtnInvMental    .BYTE $06,$4d,$00                      ; .M.
834e: 00 01 1c 50 6f 74 69 6f   .BYTE $00,$01,$1c,$50,$6f,$74,$69,$6f  ; ...Potio
8356: 6e 20 6f 66 20 49 6e 76   .BYTE $6e,$20,$6f,$66,$20,$49,$6e,$76  ; n of Inv
835e: 2e 20 4d 65 6e 74 61 6c   .BYTE $2e,$20,$4d,$65,$6e,$74,$61,$6c  ; . Mental
8366: 00 84 ff c4 01 e0 01 ed   .BYTE $00,$84,$ff,$c4,$01,$e0,$01,$ed  ; ........
836e: fe 00 91 ad 00 01 00 80   .BYTE $fe,$00,$91,$ad,$00,$01,$00,$80  ; ........
8376: 00 84 00 44 01 01 00 ed   .BYTE $00,$84,$00,$44,$01,$01,$00,$ed  ; ...D....
837e: fe 00 81 ad c6 01 00 80   .BYTE $fe,$00,$81,$ad,$c6,$01,$00,$80  ; ........
8386: 00 ec 00 44 49 6e 76 2e   .BYTE $00,$ec,$00,$44,$49,$6e,$76,$2e  ; ...DInv.
838e: 20 4d 65 6e 74 61 6c 00   .BYTE $20,$4d,$65,$6e,$74,$61,$6c,$00  ;  Mental.
8396: 67 00                     .BYTE $67,$00                          ; g.

8398: 06 4b 00  PtnInvCold      .BYTE $06,$4b,$00                      ; .K.
839b: 00 01 1a 50 6f 74 69 6f   .BYTE $00,$01,$1a,$50,$6f,$74,$69,$6f  ; ...Potio
83a3: 6e 20 6f 66 20 49 6e 76   .BYTE $6e,$20,$6f,$66,$20,$49,$6e,$76  ; n of Inv
83ab: 2e 20 43 6f 6c 64 00 84   .BYTE $2e,$20,$43,$6f,$6c,$64,$00,$84  ; . Cold..
83b3: ff c4 01 e0 01 ed fe 00   .BYTE $ff,$c4,$01,$e0,$01,$ed,$fe,$00  ; ........
83bb: 91 b0 00 01 00 80 00 84   .BYTE $91,$b0,$00,$01,$00,$80,$00,$84  ; ........
83c3: 00 44 01 01 00 ed fe 00   .BYTE $00,$44,$01,$01,$00,$ed,$fe,$00  ; .D......
83cb: 81 b0 c6 01 00 80 00 ec   .BYTE $81,$b0,$c6,$01,$00,$80,$00,$ec  ; ........
83d3: 00 44 49 6e 76 2e 20 43   .BYTE $00,$44,$49,$6e,$76,$2e,$20,$43  ; .DInv. C
83db: 6f 6c 64 00 72 73 61 00   .BYTE $6f,$6c,$64,$00,$72,$73,$61,$00  ; old.rsa.

83e3: 06 2d 00  PtnFruitJuice   .BYTE $06,$2d,$00                      ; .-.
83e6: 00 01 1c 50 6f 74 69 6f   .BYTE $00,$01,$1c,$50,$6f,$74,$69,$6f  ; ...Potio
83ee: 6e 20 6f 66 20 46 72 75   .BYTE $6e,$20,$6f,$66,$20,$46,$72,$75  ; n of Fru
83f6: 69 74 20 4a 75 69 63 65   .BYTE $69,$74,$20,$4a,$75,$69,$63,$65  ; it Juice
83fe: 00 84 ff c4 01 01 00 ed   .BYTE $00,$84,$ff,$c4,$01,$01,$00,$ed  ; ........
8406: fe 00 81 99 00 03 01 08   .BYTE $fe,$00,$81,$99,$00,$03,$01,$08  ; ........
840e: 00 00                     .BYTE $00,$00                          ; ..

8410: 06 6c 00  PtnWizardEye    .BYTE $06,$6c,$00                      ; .l.
8413: 00 01 1b 50 6f 74 69 6f   .BYTE $00,$01,$1b,$50,$6f,$74,$69,$6f  ; ...Potio
841b: 6e 20 6f 66 20 57 69 7a   .BYTE $6e,$20,$6f,$66,$20,$57,$69,$7a  ; n of Wiz
8423: 61 72 64 20 45 79 65 00   .BYTE $61,$72,$64,$20,$45,$79,$65,$00  ; ard Eye.
842b: 84 ff c4 01 75 01 5c 00   .BYTE $84,$ff,$c4,$01,$75,$01,$5c,$00  ; ....u.\.
8433: 00 91 90 00 01 00 01 00   .BYTE $00,$91,$90,$00,$01,$00,$01,$00  ; ........
843b: 84 00 44 01 74 01 00 00   .BYTE $84,$00,$44,$01,$74,$01,$00,$00  ; ..D.t...
8443: 00 91 8b 00 01 00 01 00   .BYTE $00,$91,$8b,$00,$01,$00,$01,$00  ; ........
844b: 84 00 44 01 01 00 00 00   .BYTE $84,$00,$44,$01,$01,$00,$00,$00  ; ..D.....
8453: 00 81 90 00 01 00 01 00   .BYTE $00,$81,$90,$00,$01,$00,$01,$00  ; ........
845b: 84 00 44 01 01 00 00 00   .BYTE $84,$00,$44,$01,$01,$00,$00,$00  ; ..D.....
8463: 00 81 8b 00 01 00 01 00   .BYTE $00,$81,$8b,$00,$01,$00,$01,$00  ; ........
846b: ec 00 04 57 69 7a 61 72   .BYTE $ec,$00,$04,$57,$69,$7a,$61,$72  ; ...Wizar
8473: 64 20 45 79 65 00 00 00   .BYTE $64,$20,$45,$79,$65,$00,$00,$00  ; d Eye...
847b: 00                        .BYTE $00                              ; .

847c: 06 4b 00  PtnDexterity    .BYTE $06,$4b,$00                      ; .K.
847f: 00 01 1a 50 6f 74 69 6f   .BYTE $00,$01,$1a,$50,$6f,$74,$69,$6f  ; ...Potio
8487: 6e 20 6f 66 20 44 65 78   .BYTE $6e,$20,$6f,$66,$20,$44,$65,$78  ; n of Dex
848f: 74 65 72 69 74 79 00 84   .BYTE $74,$65,$72,$69,$74,$79,$00,$84  ; terity..
8497: ff c4 01 e0 01 ed fe 00   .BYTE $ff,$c4,$01,$e0,$01,$ed,$fe,$00  ; ........
849f: 91 73 00 01 00 14 00 84   .BYTE $91,$73,$00,$01,$00,$14,$00,$84  ; .s......
84a7: 00 44 01 01 00 ed fe 00   .BYTE $00,$44,$01,$01,$00,$ed,$fe,$00  ; .D......
84af: 81 73 00 01 00 14 00 ec   .BYTE $81,$73,$00,$01,$00,$14,$00,$ec  ; .s......
84b7: 00 44 44 65 78 74 65 72   .BYTE $00,$44,$44,$65,$78,$74,$65,$72  ; .DDexter
84bf: 69 74 79 00 72 65 72 00   .BYTE $69,$74,$79,$00,$72,$65,$72,$00  ; ity.rer.

84c7: 06 4e 00  PtnInfraVision  .BYTE $06,$4e,$00                      ; .N.
84ca: 00 01 1d 50 6f 74 69 6f   .BYTE $00,$01,$1d,$50,$6f,$74,$69,$6f  ; ...Potio
84d2: 6e 20 6f 66 20 49 6e 66   .BYTE $6e,$20,$6f,$66,$20,$49,$6e,$66  ; n of Inf
84da: 72 61 2d 56 69 73 69 6f   .BYTE $72,$61,$2d,$56,$69,$73,$69,$6f  ; ra-Visio
84e2: 6e 00 84 ff c4 01 e0 01   .BYTE $6e,$00,$84,$ff,$c4,$01,$e0,$01  ; n.......
84ea: ed fe 00 91 90 00 01 00   .BYTE $ed,$fe,$00,$91,$90,$00,$01,$00  ; ........
84f2: 01 00 84 00 44 01 01 00   .BYTE $01,$00,$84,$00,$44,$01,$01,$00  ; ....D...
84fa: ed fe 00 81 90 00 01 00   .BYTE $ed,$fe,$00,$81,$90,$00,$01,$00  ; ........
8502: 01 00 ec 00 44 49 6e 66   .BYTE $01,$00,$ec,$00,$44,$49,$6e,$66  ; ....DInf
850a: 72 61 2d 56 69 73 69 6f   .BYTE $72,$61,$2d,$56,$69,$73,$69,$6f  ; ra-Visio
8512: 6e 00 00                  .BYTE $6e,$00,$00                      ; n..

8515: 0e 1c 00  PtnCleansing    .BYTE $0e,$1c,$00                      ; ...
8518: 00 01 1a 50 6f 74 69 6f   .BYTE $00,$01,$1a,$50,$6f,$74,$69,$6f  ; ...Potio
8520: 6e 20 6f 66 20 43 6c 65   .BYTE $6e,$20,$6f,$66,$20,$43,$6c,$65  ; n of Cle
8528: 61 6e 73 69 6e 67 00 00   .BYTE $61,$6e,$73,$69,$6e,$67,$00,$00  ; ansing..
8530: 81                        .BYTE $81                              ; .

8531: 06 1b 00  PtnAntidote     .BYTE $06,$1b,$00                      ; ...
8534: 00 01 19 50 6f 74 69 6f   .BYTE $00,$01,$19,$50,$6f,$74,$69,$6f  ; ...Potio
853c: 6e 20 6f 66 20 41 6e 74   .BYTE $6e,$20,$6f,$66,$20,$41,$6e,$74  ; n of Ant
8544: 69 64 6f 74 65 00 00 82   .BYTE $69,$64,$6f,$74,$65,$00,$00,$82  ; idote...

854c: 16 2d 00  PtnRestoration  .BYTE $16,$2d,$00                      ; .-.
854f: 00 01 1c 50 6f 74 69 6f   .BYTE $00,$01,$1c,$50,$6f,$74,$69,$6f  ; ...Potio
8557: 6e 20 6f 66 20 52 65 73   .BYTE $6e,$20,$6f,$66,$20,$52,$65,$73  ; n of Res
855f: 74 6f 72 61 74 69 6f 6e   .BYTE $74,$6f,$72,$61,$74,$69,$6f,$6e  ; toration
8567: 00 84 ff c4 01 01 00 ed   .BYTE $00,$84,$ff,$c4,$01,$01,$00,$ed  ; ........
856f: fe 00 01 45 00 02 01 ff   .BYTE $fe,$00,$01,$45,$00,$02,$01,$ff  ; ...E....
8577: 00 00                     .BYTE $00,$00                          ; ..

8579: 16 29 00  PtnHealing      .BYTE $16,$29,$00                      ; .).
857c: 00 01 18 50 6f 74 69 6f   .BYTE $00,$01,$18,$50,$6f,$74,$69,$6f  ; ...Potio
8584: 6e 20 6f 66 20 48 65 61   .BYTE $6e,$20,$6f,$66,$20,$48,$65,$61  ; n of Hea
858c: 6c 69 6e 67 00 84 ff c4   .BYTE $6c,$69,$6e,$67,$00,$84,$ff,$c4  ; ling....
8594: 01 01 00 ed fe 00 82 45   .BYTE $01,$01,$00,$ed,$fe,$00,$82,$45  ; .......E
859c: 00 01 00 19 00 00         .BYTE $00,$01,$00,$19,$00,$00          ; ......

85a2: 06 39 00  PtnHemlock      .BYTE $06,$39,$00                      ; .9.
85a5: 00 01 18 50 6f 74 69 6f   .BYTE $00,$01,$18,$50,$6f,$74,$69,$6f  ; ...Potio
85ad: 6e 20 6f 66 20 48 65 6d   .BYTE $6e,$20,$6f,$66,$20,$48,$65,$6d  ; n of Hem
85b5: 6c 6f 63 6b 00 82 ff c4   .BYTE $6c,$6f,$63,$6b,$00,$82,$ff,$c4  ; lock....
85bd: 00 01 00 14 00 02 92 45   .BYTE $00,$01,$00,$14,$00,$02,$92,$45  ; .......E
85c5: 00 01 00 02 00 82 00 44   .BYTE $00,$01,$00,$02,$00,$82,$00,$44  ; .......D
85cd: 00 04 00 3c 00 00 92 47   .BYTE $00,$04,$00,$3c,$00,$00,$92,$47  ; ...<...G
85d5: 00 01 00 01 00 00         .BYTE $00,$01,$00,$01,$00,$00          ; ......

85db: 06 2d 00  PtnInebriation  .BYTE $06,$2d,$00                      ; .-.
85de: 00 01 1c 50 6f 74 69 6f   .BYTE $00,$01,$1c,$50,$6f,$74,$69,$6f  ; ...Potio
85e6: 6e 20 6f 66 20 49 6e 65   .BYTE $6e,$20,$6f,$66,$20,$49,$6e,$65  ; n of Ine
85ee: 62 72 69 61 74 69 6f 6e   .BYTE $62,$72,$69,$61,$74,$69,$6f,$6e  ; briation
85f6: 00 84 ff 44 01 01 00 ed   .BYTE $00,$84,$ff,$44,$01,$01,$00,$ed  ; ...D....
85fe: fe 00 01 97 00 01 00 ff   .BYTE $fe,$00,$01,$97,$00,$01,$00,$ff  ; ........
8606: 00 00                     .BYTE $00,$00                          ; ..

8608: 03 49 00  CrystalShield   .BYTE $03,$49,$00                      ; .I.
860b: 00 06 15 43 72 79 73 74   .BYTE $00,$06,$15,$43,$72,$79,$73,$74  ; ...Cryst
8613: 61 6c 20 53 68 69 65 6c   .BYTE $61,$6c,$20,$53,$68,$69,$65,$6c  ; al Shiel
861b: 64 00 88 ff 04 01 01 00   .BYTE $64,$00,$88,$ff,$04,$01,$01,$00  ; d.......
8623: 01 00 00 81 b0 00 01 00   .BYTE $01,$00,$00,$81,$b0,$00,$01,$00  ; ........
862b: 04 00 88 ff 08 01 01 00   .BYTE $04,$00,$88,$ff,$08,$01,$01,$00  ; ........
8633: 01 00 00 91 b0 00 01 00   .BYTE $01,$00,$00,$91,$b0,$00,$01,$00  ; ........
863b: 04 00 00 ff 00 15 12 00   .BYTE $04,$00,$00,$ff,$00,$15,$12,$00  ; ........
8643: 00 00 00 00 00 00 00 13   .BYTE $00,$00,$00,$00,$00,$00,$00,$13  ; ........
864b: 10 10 ff ff aa 60         .BYTE $10,$10,$ff,$ff,$aa,$60          ; .....`

8651: 03 5c 00  ShieldOfGalahd  .BYTE $03,$5c,$00                      ; .\.
8654: 90 0f 18 53 68 69 65 6c   .BYTE $90,$0f,$18,$53,$68,$69,$65,$6c  ; ...Shiel
865c: 64 20 6f 66 20 47 61 6c   .BYTE $64,$20,$6f,$66,$20,$47,$61,$6c  ; d of Gal
8664: 61 68 61 64 00 88 ff 04   .BYTE $61,$68,$61,$64,$00,$88,$ff,$04  ; ahad....
866c: 01 01 00 01 00 00 81 a6   .BYTE $01,$01,$00,$01,$00,$00,$81,$a6  ; ........
8674: 00 0b 01 02 00 88 ff 08   .BYTE $00,$0b,$01,$02,$00,$88,$ff,$08  ; ........
867c: 01 01 00 01 00 00 91 a6   .BYTE $01,$01,$00,$01,$00,$00,$91,$a6  ; ........
8684: 00 0b 01 02 00 88 ff 25   .BYTE $00,$0b,$01,$02,$00,$88,$ff,$25  ; .......%
868c: 01 01 00 01 00 00 92 45   .BYTE $01,$01,$00,$01,$00,$00,$92,$45  ; .......E
8694: 00 01 00 03 00 00 ff 00   .BYTE $00,$01,$00,$03,$00,$00,$ff,$00  ; ........
869c: 17 00 00 00 00 00 00 00   .BYTE $17,$00,$00,$00,$00,$00,$00,$00  ; ........
86a4: 34 00 00 20 20 ff ff aa   .BYTE $34,$00,$00,$20,$20,$ff,$ff,$aa  ; 4..  ...
86ac: 70                        .BYTE $70                              ; p

86ad: 03 28 00  SpikedShield    .BYTE $03,$28,$00                      ; .(.
86b0: 00 0f 14 53 70 69 6b 65   .BYTE $00,$0f,$14,$53,$70,$69,$6b,$65  ; ...Spike
86b8: 64 20 53 68 69 65 6c 64   .BYTE $64,$20,$53,$68,$69,$65,$6c,$64  ; d Shield
86c0: 00 00 ff 00 15 12 00 00   .BYTE $00,$00,$ff,$00,$15,$12,$00,$00  ; ........
86c8: 00 00 00 00 00 00 00 12   .BYTE $00,$00,$00,$00,$00,$00,$00,$12  ; ........
86d0: 12 32 32 aa 60            .BYTE $12,$32,$32,$aa,$60              ; .22.`

86d5: 03 5c 00  ShieldOfMordrd  .BYTE $03,$5c,$00                      ; .\.
86d8: 70 0f 18 53 68 69 65 6c   .BYTE $70,$0f,$18,$53,$68,$69,$65,$6c  ; p..Shiel
86e0: 64 20 6f 66 20 4d 6f 72   .BYTE $64,$20,$6f,$66,$20,$4d,$6f,$72  ; d of Mor
86e8: 64 72 65 64 00 88 ff 04   .BYTE $64,$72,$65,$64,$00,$88,$ff,$04  ; dred....
86f0: 01 01 00 01 00 00 81 a6   .BYTE $01,$01,$00,$01,$00,$00,$81,$a6  ; ........
86f8: 00 0b 01 02 00 88 ff 08   .BYTE $00,$0b,$01,$02,$00,$88,$ff,$08  ; ........
8700: 01 01 00 01 00 00 91 a6   .BYTE $01,$01,$00,$01,$00,$00,$91,$a6  ; ........
8708: 00 0b 01 02 00 88 ff 25   .BYTE $00,$0b,$01,$02,$00,$88,$ff,$25  ; .......%
8710: 01 01 00 01 00 00 92 45   .BYTE $01,$01,$00,$01,$00,$00,$92,$45  ; .......E
8718: 00 01 00 03 00 00 ff 00   .BYTE $00,$01,$00,$03,$00,$00,$ff,$00  ; ........
8720: 17 00 00 00 00 00 00 00   .BYTE $17,$00,$00,$00,$00,$00,$00,$00  ; ........
8728: 00 34 00 10 10 ff ff aa   .BYTE $00,$34,$00,$10,$10,$ff,$ff,$aa  ; .4......
8730: 60                        .BYTE $60                              ; `

8731: 03 48 00  SpiritShield    .BYTE $03,$48,$00                      ; .H.
8734: 00 0f 14 53 70 69 72 69   .BYTE $00,$0f,$14,$53,$70,$69,$72,$69  ; ...Spiri
873c: 74 20 53 68 69 65 6c 64   .BYTE $74,$20,$53,$68,$69,$65,$6c,$64  ; t Shield
8744: 00 88 ff 04 01 01 00 01   .BYTE $00,$88,$ff,$04,$01,$01,$00,$01  ; ........
874c: 00 00 81 ad 00 01 00 10   .BYTE $00,$00,$81,$ad,$00,$01,$00,$10  ; ........
8754: 00 88 ff 08 01 01 00 01   .BYTE $00,$88,$ff,$08,$01,$01,$00,$01  ; ........
875c: 00 00 91 ad 00 01 00 10   .BYTE $00,$00,$91,$ad,$00,$01,$00,$10  ; ........
8764: 00 00 ff 00 15 00 00 00   .BYTE $00,$00,$ff,$00,$15,$00,$00,$00  ; ........
876c: 00 00 00 34 00 00 00 10   .BYTE $00,$00,$00,$34,$00,$00,$00,$10  ; ...4....
8774: 10 ff ff 82 70            .BYTE $10,$ff,$ff,$82,$70              ; ....p

8779: 03 49 00  IronwoodBoken   .BYTE $03,$49,$00                      ; .I.
877c: 00 08 15 49 72 6f 6e 77   .BYTE $00,$08,$15,$49,$72,$6f,$6e,$77  ; ...Ironw
8784: 6f 6f 64 20 42 6f 6b 65   .BYTE $6f,$6f,$64,$20,$42,$6f,$6b,$65  ; ood Boke
878c: 6e 00 88 ff 04 01 01 00   .BYTE $6e,$00,$88,$ff,$04,$01,$01,$00  ; n.......
8794: 01 00 00 81 5b 00 01 00   .BYTE $01,$00,$00,$81,$5b,$00,$01,$00  ; ....[...
879c: 14 00 88 ff 08 01 01 00   .BYTE $14,$00,$88,$ff,$08,$01,$01,$00  ; ........
87a4: 01 00 00 91 5b 00 01 00   .BYTE $01,$00,$00,$91,$5b,$00,$01,$00  ; ....[...
87ac: 14 00 00 ff 00 35 00 00   .BYTE $14,$00,$00,$ff,$00,$35,$00,$00  ; .....5..
87b4: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ; ........
87bc: 20 16 30 30 82 30         .BYTE $20,$16,$30,$30,$82,$30          ;  .00.0

87c2: 03 23 00  IronFan         .BYTE $03,$23,$00                      ; .#.
87c5: 00 02 0f 49 72 6f 6e 20   .BYTE $00,$02,$0f,$49,$72,$6f,$6e,$20  ; ...Iron
87cd: 46 61 6e 00 00 ff 00 23   .BYTE $46,$61,$6e,$00,$00,$ff,$00,$23  ; Fan....#
87d5: 22 00 00 00 00 00 00 00   .BYTE $22,$00,$00,$00,$00,$00,$00,$00  ; ".......
87dd: 00 00 10 32 20 20 8a 58   .BYTE $00,$00,$10,$32,$20,$20,$8a,$58  ; ...2  .X

87e5: 03 27 00  TowerShield     .BYTE $03,$27,$00                      ; .'.
87e8: 00 14 13 54 6f 77 65 72   .BYTE $00,$14,$13,$54,$6f,$77,$65,$72  ; ...Tower
87f0: 20 53 68 69 65 6c 64 00   .BYTE $20,$53,$68,$69,$65,$6c,$64,$00  ;  Shield.
87f8: 00 ff 00 17 00 00 00 00   .BYTE $00,$ff,$00,$17,$00,$00,$00,$00  ; ........
8800: 00 00 00 00 00 00 19 10   .BYTE $00,$00,$00,$00,$00,$00,$19,$10  ; ........
8808: 80 80 aa 80               .BYTE $80,$80,$aa,$80                  ; ....

880c: 03 28 00  Crossbow        .BYTE $03,$28,$00                      ; .(.
880f: 00 03 14 43 72 6f 73 73   .BYTE $00,$03,$14,$43,$72,$6f,$73,$73  ; ...Cross
8817: 62 6f 77 20 5b 30 33 5d   .BYTE $62,$6f,$77,$20,$5b,$30,$33,$5d  ; bow [03]
881f: 00 00 03 03 00 2a 00 00   .BYTE $00,$00,$03,$03,$00,$2a,$00,$00  ; .....*..
8827: 00 00 00 00 00 00 00 10   .BYTE $00,$00,$00,$00,$00,$00,$00,$10  ; ........
882f: 10 40 40 1f 00            .BYTE $10,$40,$40,$1f,$00              ; .@@..

8834: 02 22 00  Quarrels        .BYTE $02,$22,$00                      ; .".
8837: 00 01 14 51 75 61 72 72   .BYTE $00,$01,$14,$51,$75,$61,$72,$72  ; ...Quarr
883f: 65 6c 73 20 5b 31 30 5d   .BYTE $65,$6c,$73,$20,$5b,$31,$30,$5d  ; els [10]
8847: 00 00 03 0a 00 2a 00 00   .BYTE $00,$00,$03,$0a,$00,$2a,$00,$00  ; .....*..
884f: 00 00 00 00 00 00 00      .BYTE $00,$00,$00,$00,$00,$00,$00      ; .......

8856: 03 35 00  ChaosClub       .BYTE $03,$35,$00                      ; .5.
8859: 7f 0a 11 43 68 61 6f 73   .BYTE $7f,$0a,$11,$43,$68,$61,$6f,$73  ; ...Chaos
8861: 20 43 6c 75 62 00 88 ff   .BYTE $20,$43,$6c,$75,$62,$00,$88,$ff  ;  Club...
8869: a5 00 01 00 1f 00 00 92   .BYTE $a5,$00,$01,$00,$1f,$00,$00,$92  ; ........
8871: 45 00 01 da 01 00 00 ff   .BYTE $45,$00,$01,$da,$01,$00,$00,$ff  ; E.......
8879: 00 24 00 00 00 00 00 00   .BYTE $00,$24,$00,$00,$00,$00,$00,$00  ; .$......
8881: 00 00 18 00 14 10 80 80   .BYTE $00,$00,$18,$00,$14,$10,$80,$80  ; ........
8889: aa 80                     .BYTE $aa,$80                          ; ..

888b: 03 26 00  ShortSword      .BYTE $03,$26,$00                      ; .&.
888e: 00 0a 12 53 68 6f 72 74   .BYTE $00,$0a,$12,$53,$68,$6f,$72,$74  ; ...Short
8896: 20 53 77 6f 72 64 00 00   .BYTE $20,$53,$77,$6f,$72,$64,$00,$00  ;  Sword..
889e: ff 00 00 23 00 00 00 00   .BYTE $ff,$00,$00,$23,$00,$00,$00,$00  ; ...#....
88a6: 00 00 00 00 00 08 08 18   .BYTE $00,$00,$00,$00,$00,$08,$08,$18  ; ........
88ae: 18 80 10                  .BYTE $18,$80,$10                      ; ...

88b1: 10 4a 00  HolyHandGrnade  .BYTE $10,$4a,$00                      ; .J.
88b4: 80 02 18 48 6f 6c 79 20   .BYTE $80,$02,$18,$48,$6f,$6c,$79,$20  ; ...Holy
88bc: 48 61 6e 64 20 47 72 65   .BYTE $48,$61,$6e,$64,$20,$47,$72,$65  ; Hand Gre
88c4: 6e 61 64 65 00 88 ff 44   .BYTE $6e,$61,$64,$65,$00,$88,$ff,$44  ; nade...D
88cc: 01 01 00 01 00 00 01 dd   .BYTE $01,$01,$00,$01,$00,$00,$01,$dd  ; ........
88d4: 00 03 04 54 00 88 ff 44   .BYTE $00,$03,$04,$54,$00,$88,$ff,$44  ; ...T...D
88dc: 01 01 00 01 00 00 01 e8   .BYTE $01,$01,$00,$01,$00,$00,$01,$e8  ; ........
88e4: 00 01 00 ff 00 88 ff 64   .BYTE $00,$01,$00,$ff,$00,$88,$ff,$64  ; .......d
88ec: 01 01 00 01 00 00 92 45   .BYTE $01,$01,$00,$01,$00,$00,$92,$45  ; .......E
88f4: 00 01 00 14 00 00 01      .BYTE $00,$01,$00,$14,$00,$00,$01      ; .......

88fb: 03 1f 00  Pike            .BYTE $03,$1f,$00                      ; ...
88fe: 00 0a 0b 50 69 6b 65 00   .BYTE $00,$0a,$0b,$50,$69,$6b,$65,$00  ; ...Pike.
8906: 00 ff 00 22 1a 00 00 00   .BYTE $00,$ff,$00,$22,$1a,$00,$00,$00  ; ..."....
890e: 00 00 00 00 00 00 14 08   .BYTE $00,$00,$00,$00,$00,$00,$14,$08  ; ........
8916: 30 30 c3 23               .BYTE $30,$30,$c3,$23                  ; 00.#

891a: 03 1f 00  Dirk            .BYTE $03,$1f,$00                      ; ...
891d: 00 0a 0b 44 69 72 6b 00   .BYTE $00,$0a,$0b,$44,$69,$72,$6b,$00  ; ...Dirk.
8925: 00 ff 00 00 23 00 00 00   .BYTE $00,$ff,$00,$00,$23,$00,$00,$00  ; ....#...
892d: 00 00 00 00 00 00 04 10   .BYTE $00,$00,$00,$00,$00,$00,$04,$10  ; ........
8935: 10 10 81 f4               .BYTE $10,$10,$81,$f4                  ; ....

8939: 04 44 00  PantherGloves   .BYTE $04,$44,$00                      ; .D.
893c: 00 02 15 50 61 6e 74 68   .BYTE $00,$02,$15,$50,$61,$6e,$74,$68  ; ...Panth
8944: 65 72 20 47 6c 6f 76 65   .BYTE $65,$72,$20,$47,$6c,$6f,$76,$65  ; er Glove
894c: 73 00 88 ff 04 01 01 00   .BYTE $73,$00,$88,$ff,$04,$01,$01,$00  ; s.......
8954: af de 00 81 00 01 02 01   .BYTE $af,$de,$00,$81,$00,$01,$02,$01  ; ........
895c: 22 00 88 ff 08 01 01 00   .BYTE $22,$00,$88,$ff,$08,$01,$01,$00  ; ".......
8964: af de 00 91 00 01 02 01   .BYTE $af,$de,$00,$91,$00,$01,$02,$01  ; ........
896c: 22 00 00 02 22 23 00 00   .BYTE $22,$00,$00,$02,$22,$23,$00,$00  ; "..."#..
8974: 11 00 00 00 00 00 11 40   .BYTE $11,$00,$00,$00,$00,$00,$11,$40  ; .......@
897c: 40                        .BYTE $40                              ; @

897d: 04 43 00  HelmOfLight     .BYTE $04,$43,$00                      ; .C.
8980: 00 02 14 48 65 6c 6d 20   .BYTE $00,$02,$14,$48,$65,$6c,$6d,$20  ; ...Helm
8988: 6f 66 20 4c 69 67 68 74   .BYTE $6f,$66,$20,$4c,$69,$67,$68,$74  ; of Light
8990: 00 88 ff 04 01 01 00 af   .BYTE $00,$88,$ff,$04,$01,$01,$00,$af  ; ........
8998: de 00 81 90 00 01 00 01   .BYTE $de,$00,$81,$90,$00,$01,$00,$01  ; ........
89a0: 00 88 ff 08 01 01 00 af   .BYTE $00,$88,$ff,$08,$01,$01,$00,$af  ; ........
89a8: de 00 91 90 00 01 00 01   .BYTE $de,$00,$91,$90,$00,$01,$00,$01  ; ........
89b0: 00 00 00 23 24 00 00 11   .BYTE $00,$00,$00,$23,$24,$00,$00,$11  ; ...#$...
89b8: 00 00 00 00 00 00 60 60   .BYTE $00,$00,$00,$00,$00,$00,$60,$60  ; ......``

89c0: 04 28 00  DragnsknHaubrk  .BYTE $04,$28,$00                      ; .(.
89c3: 00 0a 19 44 72 61 67 6f   .BYTE $00,$0a,$19,$44,$72,$61,$67,$6f  ; ...Drago
89cb: 6e 73 6b 69 6e 20 48 61   .BYTE $6e,$73,$6b,$69,$6e,$20,$48,$61  ; nskin Ha
89d3: 75 62 65 72 6b 00 00 01   .BYTE $75,$62,$65,$72,$6b,$00,$00,$01  ; uberk...
89db: 34 34 00 00 34 00 00 00   .BYTE $34,$34,$00,$00,$34,$00,$00,$00  ; 44..4...
89e3: 00 00 00 fe fe            .BYTE $00,$00,$00,$fe,$fe              ; .....

89e8: 04 44 00  GoldenGreaves   .BYTE $04,$44,$00                      ; .D.
89eb: 00 04 15 47 6f 6c 64 65   .BYTE $00,$04,$15,$47,$6f,$6c,$64,$65  ; ...Golde
89f3: 6e 20 47 72 65 61 76 65   .BYTE $6e,$20,$47,$72,$65,$61,$76,$65  ; n Greave
89fb: 73 00 88 ff 04 01 01 00   .BYTE $73,$00,$88,$ff,$04,$01,$01,$00  ; s.......
8a03: af de 00 81 4b 00 01 00   .BYTE $af,$de,$00,$81,$4b,$00,$01,$00  ; ....K...
8a0b: 19 00 88 ff 08 01 01 00   .BYTE $19,$00,$88,$ff,$08,$01,$01,$00  ; ........
8a13: af de 00 91 4b 00 01 00   .BYTE $af,$de,$00,$91,$4b,$00,$01,$00  ; ....K...
8a1b: 19 00 00 03 32 42 11 11   .BYTE $19,$00,$00,$03,$32,$42,$11,$11  ; ....2B..
8a23: 11 11 11 11 11 11 22 50   .BYTE $11,$11,$11,$11,$11,$11,$22,$50  ; ......"P
8a2b: 50                        .BYTE $50                              ; P

8a2c: 04 20 00  PlateHelm       .BYTE $04,$20,$00                      ; . .
8a2f: 00 06 11 50 6c 61 74 65   .BYTE $00,$06,$11,$50,$6c,$61,$74,$65  ; ...Plate
8a37: 20 48 65 6c 6d 00 00 00   .BYTE $20,$48,$65,$6c,$6d,$00,$00,$00  ;  Helm...
8a3f: 25 33 00 00 11 00 00 00   .BYTE $25,$33,$00,$00,$11,$00,$00,$00  ; %3......
8a47: 00 00 00 60 60            .BYTE $00,$00,$00,$60,$60              ; ...``

8a4c: 04 25 00  PlateGauntlets  .BYTE $04,$25,$00                      ; .%.
8a4f: 00 06 16 50 6c 61 74 65   .BYTE $00,$06,$16,$50,$6c,$61,$74,$65  ; ...Plate
8a57: 20 47 61 75 6e 74 6c 65   .BYTE $20,$47,$61,$75,$6e,$74,$6c,$65  ;  Gauntle
8a5f: 74 73 00 00 02 25 33 00   .BYTE $74,$73,$00,$00,$02,$25,$33,$00  ; ts...%3.
8a67: 00 11 00 00 00 00 00 00   .BYTE $00,$11,$00,$00,$00,$00,$00,$00  ; ........
8a6f: 80 80                     .BYTE $80,$80                          ; ..

8a71: 04 24 00  PlateLeggings   .BYTE $04,$24,$00                      ; .$.
8a74: 00 02 15 50 6c 61 74 65   .BYTE $00,$02,$15,$50,$6c,$61,$74,$65  ; ...Plate
8a7c: 20 4c 65 67 67 69 6e 67   .BYTE $20,$4c,$65,$67,$67,$69,$6e,$67  ;  Legging
8a84: 73 00 00 03 25 33 00 00   .BYTE $73,$00,$00,$03,$25,$33,$00,$00  ; s...%3..
8a8c: 11 00 00 00 00 00 00 80   .BYTE $11,$00,$00,$00,$00,$00,$00,$80  ; ........
8a94: 80                        .BYTE $80                              ; .

8a95: 04 21 00  PlateArmor      .BYTE $04,$21,$00                      ; .!.
8a98: 00 10 12 50 6c 61 74 65   .BYTE $00,$10,$12,$50,$6c,$61,$74,$65  ; ...Plate
8aa0: 20 41 72 6d 6f 72 00 00   .BYTE $20,$41,$72,$6d,$6f,$72,$00,$00  ;  Armor..
8aa8: 01 25 33 00 00 11 00 00   .BYTE $01,$25,$33,$00,$00,$11,$00,$00  ; .%3.....
8ab0: 00 00 00 00 80 80         .BYTE $00,$00,$00,$00,$80,$80          ; ......

8ab6: 04 21 00  ScaleArmor      .BYTE $04,$21,$00                      ; .!.
8ab9: 00 02 12 53 63 61 6c 65   .BYTE $00,$02,$12,$53,$63,$61,$6c,$65  ; ...Scale
8ac1: 20 61 72 6d 6f 72 00 00   .BYTE $20,$61,$72,$6d,$6f,$72,$00,$00  ;  armor..
8ac9: 01 32 32 00 00 00 00 00   .BYTE $01,$32,$32,$00,$00,$00,$00,$00  ; .22.....
8ad1: 00 00 00 00 70 70         .BYTE $00,$00,$00,$00,$70,$70          ; ....pp

8ad7: 04 25 00  TruesilverHelm  .BYTE $04,$25,$00                      ; .%.
8ada: 00 02 16 54 72 75 65 73   .BYTE $00,$02,$16,$54,$72,$75,$65,$73  ; ...Trues
8ae2: 69 6c 76 65 72 20 68 65   .BYTE $69,$6c,$76,$65,$72,$20,$68,$65  ; ilver he
8aea: 6c 6d 00 00 00 33 33 11   .BYTE $6c,$6d,$00,$00,$00,$33,$33,$11  ; lm...33.
8af2: 11 11 11 11 22 22 22 21   .BYTE $11,$11,$11,$11,$22,$22,$22,$21  ; ...."""!
8afa: f0 f0                     .BYTE $f0,$f0                          ; ..

8afc: 04 25 00  TruesilverCoat  .BYTE $04,$25,$00                      ; .%.
8aff: 00 05 16 54 72 75 65 73   .BYTE $00,$05,$16,$54,$72,$75,$65,$73  ; ...Trues
8b07: 69 6c 76 65 72 20 63 6f   .BYTE $69,$6c,$76,$65,$72,$20,$63,$6f  ; ilver co
8b0f: 61 74 00 00 01 33 33 11   .BYTE $61,$74,$00,$00,$01,$33,$33,$11  ; at...33.
8b17: 11 11 11 11 22 22 22 11   .BYTE $11,$11,$11,$11,$22,$22,$22,$11  ; ....""".
8b1f: f0 f0                     .BYTE $f0,$f0                          ; ..

8b21: 04 2a 00  TruslvrGuantlt  .BYTE $04,$2a,$00                      ; .*.
8b24: 00 03 1b 54 72 75 65 73   .BYTE $00,$03,$1b,$54,$72,$75,$65,$73  ; ...Trues
8b2c: 69 6c 76 65 72 20 67 75   .BYTE $69,$6c,$76,$65,$72,$20,$67,$75  ; ilver gu
8b34: 61 6e 74 6c 65 74 73 00   .BYTE $61,$6e,$74,$6c,$65,$74,$73,$00  ; antlets.
8b3c: 00 02 33 33 11 11 11 11   .BYTE $00,$02,$33,$33,$11,$11,$11,$11  ; ..33....
8b44: 11 22 22 22 11 f0 f0      .BYTE $11,$22,$22,$22,$11,$f0,$f0      ; ."""...

8b4b: 04 29 00  TruslvrLeggngs  .BYTE $04,$29,$00                      ; .).
8b4e: 00 04 1a 54 72 75 65 73   .BYTE $00,$04,$1a,$54,$72,$75,$65,$73  ; ...Trues
8b56: 69 6c 76 65 72 20 6c 65   .BYTE $69,$6c,$76,$65,$72,$20,$6c,$65  ; ilver le
8b5e: 67 67 69 6e 67 73 00 00   .BYTE $67,$67,$69,$6e,$67,$73,$00,$00  ; ggings..
8b66: 03 33 33 11 11 11 11 11   .BYTE $03,$33,$33,$11,$11,$11,$11,$11  ; .33.....
8b6e: 22 22 22 11 f0 f0         .BYTE $22,$22,$22,$11,$f0,$f0          ; """...

8b74: 04 26 00  CuirbouilliHlm  .BYTE $04,$26,$00                      ; .&.
8b77: 00 03 17 43 75 69 72 62   .BYTE $00,$03,$17,$43,$75,$69,$72,$62  ; ...Cuirb
8b7f: 6f 75 69 6c 6c 69 20 48   .BYTE $6f,$75,$69,$6c,$6c,$69,$20,$48  ; ouilli H
8b87: 65 6c 6d 00 00 00 23 23   .BYTE $65,$6c,$6d,$00,$00,$00,$23,$23  ; elm...##
8b8f: 00 00 11 00 00 00 00 00   .BYTE $00,$00,$11,$00,$00,$00,$00,$00  ; ........
8b97: 00 40 40                  .BYTE $00,$40,$40                      ; .@@

8b9a: 04 28 00  BronzeBrstplt   .BYTE $04,$28,$00                      ; .(.
8b9d: 00 0c 19 42 72 6f 6e 7a   .BYTE $00,$0c,$19,$42,$72,$6f,$6e,$7a  ; ...Bronz
8ba5: 65 20 42 72 65 61 73 74   .BYTE $65,$20,$42,$72,$65,$61,$73,$74  ; e Breast
8bad: 70 6c 61 74 65 00 00 01   .BYTE $70,$6c,$61,$74,$65,$00,$00,$01  ; plate...
8bb5: 24 24 00 00 11 00 00 00   .BYTE $24,$24,$00,$00,$11,$00,$00,$00  ; $$......
8bbd: 00 00 00 50 50            .BYTE $00,$00,$00,$50,$50              ; ...PP

8bc2: 04 24 00  BronzeBracers   .BYTE $04,$24,$00                      ; .$.
8bc5: 00 04 15 42 72 6f 6e 7a   .BYTE $00,$04,$15,$42,$72,$6f,$6e,$7a  ; ...Bronz
8bcd: 65 20 42 72 61 63 65 72   .BYTE $65,$20,$42,$72,$61,$63,$65,$72  ; e Bracer
8bd5: 73 00 00 02 24 24 00 00   .BYTE $73,$00,$00,$02,$24,$24,$00,$00  ; s...$$..
8bdd: 11 00 00 00 00 00 00 40   .BYTE $11,$00,$00,$00,$00,$00,$00,$40  ; .......@
8be5: 40                        .BYTE $40                              ; @

8be6: 05 1b 00  WhiteLinenShrt  .BYTE $05,$1b,$00                      ; ...
8be9: 00 01 18 57 68 69 74 65   .BYTE $00,$01,$18,$57,$68,$69,$74,$65  ; ...White
8bf1: 20 4c 69 6e 65 6e 20 53   .BYTE $20,$4c,$69,$6e,$65,$6e,$20,$53  ;  Linen S
8bf9: 68 69 72 74 00 00 01 01   .BYTE $68,$69,$72,$74,$00,$00,$01,$01  ; hirt....

8c01: 05 1b 00  BlckSilkKimono  .BYTE $05,$1b,$00                      ; ...
8c04: 00 01 18 42 6c 61 63 6b   .BYTE $00,$01,$18,$42,$6c,$61,$63,$6b  ; ...Black
8c0c: 20 53 69 6c 6b 20 4b 69   .BYTE $20,$53,$69,$6c,$6b,$20,$4b,$69  ;  Silk Ki
8c14: 6d 6f 6e 6f 00 00 02 ff   .BYTE $6d,$6f,$6e,$6f,$00,$00,$02,$ff  ; mono....

8c1c: 05 14 00  CheapRobe       .BYTE $05,$14,$00                      ; ...
8c1f: 00 01 11 43 68 65 61 70   .BYTE $00,$01,$11,$43,$68,$65,$61,$70  ; ...Cheap
8c27: 20 52 6f 62 65 00 00 00   .BYTE $20,$52,$6f,$62,$65,$00,$00,$00  ;  Robe...
8c2f: 01                        .BYTE $01                              ; .

8c30: 05 55 00  ElvenCloak      .BYTE $05,$55,$00                      ; .U.
8c33: 00 01 12 45 6c 76 65 6e   .BYTE $00,$01,$12,$45,$6c,$76,$65,$6e  ; ...Elven
8c3b: 20 43 6c 6f 61 6b 00 88   .BYTE $20,$43,$6c,$6f,$61,$6b,$00,$88  ;  Cloak..
8c43: ff 04 01 01 00 00 00 00   .BYTE $ff,$04,$01,$01,$00,$00,$00,$00  ; ........
8c4b: 91 82 00 01 00 04 00 88   .BYTE $91,$82,$00,$01,$00,$04,$00,$88  ; ........
8c53: ff 04 01 01 00 00 00 00   .BYTE $ff,$04,$01,$01,$00,$00,$00,$00  ; ........
8c5b: 81 8d 00 01 00 01 00 88   .BYTE $81,$8d,$00,$01,$00,$01,$00,$88  ; ........
8c63: ff 08 01 01 00 00 00 00   .BYTE $ff,$08,$01,$01,$00,$00,$00,$00  ; ........
8c6b: 81 82 00 01 00 04 00 88   .BYTE $81,$82,$00,$01,$00,$04,$00,$88  ; ........
8c73: ff 08 01 01 00 00 00 00   .BYTE $ff,$08,$01,$01,$00,$00,$00,$00  ; ........
8c7b: 91 8d 00 01 00 01 00 00   .BYTE $91,$8d,$00,$01,$00,$01,$00,$00  ; ........
8c83: 00 01                     .BYTE $00,$01                          ; ..

8c85: 05 35 00  ElvenBoots      .BYTE $05,$35,$00                      ; .5.
8c88: 00 01 12 45 6c 76 65 6e   .BYTE $00,$01,$12,$45,$6c,$76,$65,$6e  ; ...Elven
8c90: 20 42 6f 6f 74 73 00 88   .BYTE $20,$42,$6f,$6f,$74,$73,$00,$88  ;  Boots..
8c98: ff 04 01 01 00 00 00 00   .BYTE $ff,$04,$01,$01,$00,$00,$00,$00  ; ........
8ca0: 81 7b 00 01 00 20 00 88   .BYTE $81,$7b,$00,$01,$00,$20,$00,$88  ; .{... ..
8ca8: ff 08 01 01 00 00 00 00   .BYTE $ff,$08,$01,$01,$00,$00,$00,$00  ; ........
8cb0: 91 7b 00 01 00 20 00 00   .BYTE $91,$7b,$00,$01,$00,$20,$00,$00  ; .{... ..
8cb8: 01 01                     .BYTE $01,$01                          ; ..

8cba: 05 36 00  CrystalBelt     .BYTE $05,$36,$00                      ; .6.
8cbd: 00 01 13 43 72 79 73 74   .BYTE $00,$01,$13,$43,$72,$79,$73,$74  ; ...Cryst
8cc5: 61 6c 20 42 65 6c 74 00   .BYTE $61,$6c,$20,$42,$65,$6c,$74,$00  ; al Belt.
8ccd: 88 ff 04 01 01 00 00 00   .BYTE $88,$ff,$04,$01,$01,$00,$00,$00  ; ........
8cd5: 00 81 4b 00 01 00 14 00   .BYTE $00,$81,$4b,$00,$01,$00,$14,$00  ; ..K.....
8cdd: 88 ff 08 01 01 00 00 00   .BYTE $88,$ff,$08,$01,$01,$00,$00,$00  ; ........
8ce5: 00 91 4b 00 01 00 14 00   .BYTE $00,$91,$4b,$00,$01,$00,$14,$00  ; ..K.....
8ced: 00 03 01                  .BYTE $00,$03,$01                      ; ...

8cf0: 05 1a 00  BlueSuedeShoes  .BYTE $05,$1a,$00                      ; ...
8cf3: 00 01 17 42 6c 75 65 20   .BYTE $00,$01,$17,$42,$6c,$75,$65,$20  ; ...Blue
8cfb: 53 75 65 64 65 20 53 68   .BYTE $53,$75,$65,$64,$65,$20,$53,$68  ; Suede Sh
8d03: 6f 65 73 00 00 04 01      .BYTE $6f,$65,$73,$00,$00,$04,$01      ; oes....

8d0a: 05 1f 00  BlckWlnBreechs  .BYTE $05,$1f,$00                      ; ...
8d0d: 00 01 1c 42 6c 61 63 6b   .BYTE $00,$01,$1c,$42,$6c,$61,$63,$6b  ; ...Black
8d15: 20 57 6f 6f 6c 65 6e 20   .BYTE $20,$57,$6f,$6f,$6c,$65,$6e,$20  ;  Woolen
8d1d: 42 72 65 65 63 68 65 73   .BYTE $42,$72,$65,$65,$63,$68,$65,$73  ; Breeches
8d25: 00 00 02 02               .BYTE $00,$00,$02,$02                  ; ....

8d29: 05 20 00  SlvrBrcdBodice  .BYTE $05,$20,$00                      ; . .
8d2c: 00 01 1d 53 69 6c 76 65   .BYTE $00,$01,$1d,$53,$69,$6c,$76,$65  ; ...Silve
8d34: 72 20 42 72 6f 63 61 64   .BYTE $72,$20,$42,$72,$6f,$63,$61,$64  ; r Brocad
8d3c: 65 64 20 42 6f 64 69 63   .BYTE $65,$64,$20,$42,$6f,$64,$69,$63  ; ed Bodic
8d44: 65 00 00 02 01            .BYTE $65,$00,$00,$02,$01              ; e....

8d49: 05 18 00  RedPlaidKilt    .BYTE $05,$18,$00                      ; ...
8d4c: 00 01 15 52 65 64 20 50   .BYTE $00,$01,$15,$52,$65,$64,$20,$50  ; ...Red P
8d54: 6c 61 69 64 20 4b 69 6c   .BYTE $6c,$61,$69,$64,$20,$4b,$69,$6c  ; laid Kil
8d5c: 74 00 00 03 01            .BYTE $74,$00,$00,$03,$01              ; t....

8d61: 05 1e 00  GldSilkPntalns  .BYTE $05,$1e,$00                      ; ...
8d64: 00 01 1b 47 6f 6c 64 20   .BYTE $00,$01,$1b,$47,$6f,$6c,$64,$20  ; ...Gold
8d6c: 53 69 6c 6b 20 50 61 6e   .BYTE $53,$69,$6c,$6b,$20,$50,$61,$6e  ; Silk Pan
8d74: 74 61 6c 6f 6f 6e 73 00   .BYTE $74,$61,$6c,$6f,$6f,$6e,$73,$00  ; taloons.
8d7c: 00 03 00                  .BYTE $00,$03,$00                      ; ...

8d7f: 05 18 00  LeatherJerkin   .BYTE $05,$18,$00                      ; ...
8d82: 00 01 15 4c 65 61 74 68   .BYTE $00,$01,$15,$4c,$65,$61,$74,$68  ; ...Leath
8d8a: 65 72 20 4a 65 72 6b 69   .BYTE $65,$72,$20,$4a,$65,$72,$6b,$69  ; er Jerki
8d92: 6e 00 00 01 01            .BYTE $6e,$00,$00,$01,$01              ; n....

8d97: 05 1c 00  FlppyLeathrHat  .BYTE $05,$1c,$00                      ; ...
8d9a: 00 01 19 46 6c 6f 70 70   .BYTE $00,$01,$19,$46,$6c,$6f,$70,$70  ; ...Flopp
8da2: 79 20 4c 65 61 74 68 65   .BYTE $79,$20,$4c,$65,$61,$74,$68,$65  ; y Leathe
8daa: 72 20 48 61 74 00 00 01   .BYTE $72,$20,$48,$61,$74,$00,$00,$01  ; r Hat...
8db2: 01                        .BYTE $01                              ; .

8db3: 05 1e 00  BlckCottnPrtlt  .BYTE $05,$1e,$00                      ; ...
8db6: 00 01 1b 42 6c 61 63 6b   .BYTE $00,$01,$1b,$42,$6c,$61,$63,$6b  ; ...Black
8dbe: 20 43 6f 74 74 6f 6e 20   .BYTE $20,$43,$6f,$74,$74,$6f,$6e,$20  ;  Cotton
8dc6: 50 61 72 74 6c 65 74 00   .BYTE $50,$61,$72,$74,$6c,$65,$74,$00  ; Partlet.
8dce: 00 01 02                  .BYTE $00,$01,$02                      ; ...

8dd1: 05 35 00  SilverSash      .BYTE $05,$35,$00                      ; .5.
8dd4: 00 01 12 53 69 6c 76 65   .BYTE $00,$01,$12,$53,$69,$6c,$76,$65  ; ...Silve
8ddc: 72 20 53 61 73 68 00 88   .BYTE $72,$20,$53,$61,$73,$68,$00,$88  ; r Sash..
8de4: ff 04 01 01 00 00 00 00   .BYTE $ff,$04,$01,$01,$00,$00,$00,$00  ; ........
8dec: 81 73 00 01 00 10 00 88   .BYTE $81,$73,$00,$01,$00,$10,$00,$88  ; .s......
8df4: ff 08 01 01 00 00 00 00   .BYTE $ff,$08,$01,$01,$00,$00,$00,$00  ; ........
8dfc: 91 73 00 01 00 10 00 00   .BYTE $91,$73,$00,$01,$00,$10,$00,$00  ; .s......
8e04: 04 00                     .BYTE $04,$00                          ; ..

8e06: 05 36 00  StealthSuit     .BYTE $05,$36,$00                      ; .6.
8e09: 00 01 13 53 74 65 61 6c   .BYTE $00,$01,$13,$53,$74,$65,$61,$6c  ; ...Steal
8e11: 74 68 20 53 75 69 74 00   .BYTE $74,$68,$20,$53,$75,$69,$74,$00  ; th Suit.
8e19: 88 ff 04 01 01 00 00 00   .BYTE $88,$ff,$04,$01,$01,$00,$00,$00  ; ........
8e21: 00 81 81 00 01 00 40 00   .BYTE $00,$81,$81,$00,$01,$00,$40,$00  ; ......@.
8e29: 88 ff 08 01 01 00 00 00   .BYTE $88,$ff,$08,$01,$01,$00,$00,$00  ; ........
8e31: 00 91 81 00 01 00 40 00   .BYTE $00,$91,$81,$00,$01,$00,$40,$00  ; ......@.
8e39: 00 f1 03                  .BYTE $00,$f1,$03                      ; ...

8e3c: 07 14 00  SilverKey       .BYTE $07,$14,$00                      ; ...
8e3f: 00 00 11 53 69 6c 76 65   .BYTE $00,$00,$11,$53,$69,$6c,$76,$65  ; ...Silve
8e47: 72 20 4b 65 79 00 00 02   .BYTE $72,$20,$4b,$65,$79,$00,$00,$02  ; r Key...
8e4f: 07                        .BYTE $07                              ; .

8e50: 07 1a 00  GoblinRingHalf  .BYTE $07,$1a,$00                      ; ...
8e53: 00 00 17 47 6f 62 6c 69   .BYTE $00,$00,$17,$47,$6f,$62,$6c,$69  ; ...Gobli
8e5b: 6e 20 52 69 6e 67 20 48   .BYTE $6e,$20,$52,$69,$6e,$67,$20,$48  ; n Ring H
8e63: 61 6c 66 00 00 02 03      .BYTE $61,$6c,$66,$00,$00,$02,$03      ; alf....

8e6a: 07 19 00  TrollRingHalf   .BYTE $07,$19,$00                      ; ...
8e6d: 00 00 16 54 72 6f 6c 6c   .BYTE $00,$00,$16,$54,$72,$6f,$6c,$6c  ; ...Troll
8e75: 20 52 69 6e 67 20 48 61   .BYTE $20,$52,$69,$6e,$67,$20,$48,$61  ;  Ring Ha
8e7d: 6c 66 00 00 02 04         .BYTE $6c,$66,$00,$00,$02,$04          ; lf....

8e83: 07 15 00  StaffPiece      .BYTE $07,$15,$00                      ; ...
8e86: 00 00 12 53 74 61 66 66   .BYTE $00,$00,$12,$53,$74,$61,$66,$66  ; ...Staff
8e8e: 20 50 69 65 63 65 00 00   .BYTE $20,$50,$69,$65,$63,$65,$00,$00  ;  Piece..
8e96: 02 06                     .BYTE $02,$06                          ; ..

8e98: 07 22 00  PacCard         .BYTE $07,$22,$00                      ; .".
8e9b: 00 00 0f 50 41 43 20 63   .BYTE $00,$00,$0f,$50,$41,$43,$20,$63  ; ...PAC c
8ea3: 61 72 64 00 88 ff 04 01   .BYTE $61,$72,$64,$00,$88,$ff,$04,$01  ; ard.....
8eab: 01 00 00 00 00 e1 88 00   .BYTE $01,$00,$00,$00,$00,$e1,$88,$00  ; ........
8eb3: 01 00 01 00 00 02 01      .BYTE $01,$00,$01,$00,$00,$02,$01      ; .......

8eba: 03 4a 00  MirrorShield    .BYTE $03,$4a,$00                      ; .J.
8ebd: 00 0a 16 4d 69 72 72 6f   .BYTE $00,$0a,$16,$4d,$69,$72,$72,$6f  ; ...Mirro
8ec5: 72 65 64 20 53 68 69 65   .BYTE $72,$65,$64,$20,$53,$68,$69,$65  ; red Shie
8ecd: 6c 64 00 88 ff 04 01 01   .BYTE $6c,$64,$00,$88,$ff,$04,$01,$01  ; ld......
8ed5: 00 01 00 00 81 ac 00 01   .BYTE $00,$01,$00,$00,$81,$ac,$00,$01  ; ........
8edd: 00 0a 00 88 ff 08 01 01   .BYTE $00,$0a,$00,$88,$ff,$08,$01,$01  ; ........
8ee5: 00 01 00 00 91 ac 00 01   .BYTE $00,$01,$00,$00,$91,$ac,$00,$01  ; ........
8eed: 00 0a 00 00 ff 00 14 00   .BYTE $00,$0a,$00,$00,$ff,$00,$14,$00  ; ........
8ef5: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ; ........
8efd: 00 10 10 ff ff 82 60      .BYTE $00,$10,$10,$ff,$ff,$82,$60      ; ......`

8f04: 07 47 00  ReforgedRing    .BYTE $07,$47,$00                      ; .G.
8f07: 00 00 14 52 65 66 6f 72   .BYTE $00,$00,$14,$52,$65,$66,$6f,$72  ; ...Refor
8f0f: 67 65 64 20 52 69 6e 67   .BYTE $67,$65,$64,$20,$52,$69,$6e,$67  ; ged Ring
8f17: 00 88 ff 01 00 ee 02 ee   .BYTE $00,$88,$ff,$01,$00,$ee,$02,$ee  ; ........
8f1f: 02 00 03 99 00 01 00 ff   .BYTE $02,$00,$03,$99,$00,$01,$00,$ff  ; ........
8f27: 00 88 00 01 00 d0 02 dc   .BYTE $00,$88,$00,$01,$00,$d0,$02,$dc  ; ........
8f2f: 05 00 91 85 00 01 00 01   .BYTE $05,$00,$91,$85,$00,$01,$00,$01  ; ........
8f37: 00 88 ff 01 00 ee 02 ee   .BYTE $00,$88,$ff,$01,$00,$ee,$02,$ee  ; ........
8f3f: 02 00 03 4d 00 07 08 00   .BYTE $02,$00,$03,$4d,$00,$07,$08,$00  ; ...M....
8f47: 00 00 02 02               .BYTE $00,$00,$02,$02                  ; ....

8f4b: 07 24 00  Bloodstone      .BYTE $07,$24,$00                      ; .$.
8f4e: 00 00 11 42 6c 6f 6f 64   .BYTE $00,$00,$11,$42,$6c,$6f,$6f,$64  ; ...Blood
8f56: 73 74 6f 6e 65 00 88 ff   .BYTE $73,$74,$6f,$6e,$65,$00,$88,$ff  ; stone...
8f5e: 01 00 dc 05 dc 05 00 02   .BYTE $01,$00,$dc,$05,$dc,$05,$00,$02  ; ........
8f66: 45 00 01 00 ff 00 00 02   .BYTE $45,$00,$01,$00,$ff,$00,$00,$02  ; E.......
8f6e: 08                        .BYTE $08                              ; .

8f6f: 05 38 00  WingedSandals   .BYTE $05,$38,$00                      ; .8.
8f72: 00 01 15 57 69 6e 67 65   .BYTE $00,$01,$15,$57,$69,$6e,$67,$65  ; ...Winge
8f7a: 64 20 53 61 6e 64 61 6c   .BYTE $64,$20,$53,$61,$6e,$64,$61,$6c  ; d Sandal
8f82: 73 00 88 ff 04 01 01 00   .BYTE $73,$00,$88,$ff,$04,$01,$01,$00  ; s.......
8f8a: 00 00 00 81 73 00 02 08   .BYTE $00,$00,$00,$81,$73,$00,$02,$08  ; ....s...
8f92: 32 00 88 ff 08 01 01 00   .BYTE $32,$00,$88,$ff,$08,$01,$01,$00  ; 2.......
8f9a: 00 00 00 91 73 00 02 08   .BYTE $00,$00,$00,$91,$73,$00,$02,$08  ; ....s...
8fa2: 32 00 00 08 00            .BYTE $32,$00,$00,$08,$00              ; 2....

8fa7: 05 29 00  MorganasTiara   .BYTE $05,$29,$00                      ; .).
8faa: 00 01 16 4d 6f 72 67 61   .BYTE $00,$01,$16,$4d,$6f,$72,$67,$61  ; ...Morga
8fb2: 6e 61 27 73 20 54 69 61   .BYTE $6e,$61,$27,$73,$20,$54,$69,$61  ; na's Tia
8fba: 72 61 00 88 ff 84 00 01   .BYTE $72,$61,$00,$88,$ff,$84,$00,$01  ; ra......
8fc2: 00 11 00 00 82 45 00 01   .BYTE $00,$11,$00,$00,$82,$45,$00,$01  ; .....E..
8fca: 00 01 00 00 0b 01         .BYTE $00,$01,$00,$00,$0b,$01          ; ......

8fd0: 05 3d 00  CloakLevitatn   .BYTE $05,$3d,$00                      ; .=.
8fd3: 00 01 1a 43 6c 6f 61 6b   .BYTE $00,$01,$1a,$43,$6c,$6f,$61,$6b  ; ...Cloak
8fdb: 20 6f 66 20 4c 65 76 69   .BYTE $20,$6f,$66,$20,$4c,$65,$76,$69  ;  of Levi
8fe3: 74 61 74 69 6f 6e 00 88   .BYTE $74,$61,$74,$69,$6f,$6e,$00,$88  ; tation..
8feb: ff 04 01 01 00 00 00 00   .BYTE $ff,$04,$01,$01,$00,$00,$00,$00  ; ........
8ff3: 81 7b 00 01 00 60 00 88   .BYTE $81,$7b,$00,$01,$00,$60,$00,$88  ; .{...`..
8ffb: ff 08 01 01 00 00 00 00   .BYTE $ff,$08,$01,$01,$00,$00,$00,$00  ; ........
9003: 91 7b 00 01 00 60 00 00   .BYTE $91,$7b,$00,$01,$00,$60,$00,$00  ; .{...`..
900b: 04 01                     .BYTE $04,$01                          ; ..

900d: 04 29 00  CrystalBrstplt  .BYTE $04,$29,$00                      ; .).
9010: 00 12 1a 43 72 79 73 74   .BYTE $00,$12,$1a,$43,$72,$79,$73,$74  ; ...Cryst
9018: 61 6c 20 42 72 65 61 73   .BYTE $61,$6c,$20,$42,$72,$65,$61,$73  ; al Breas
9020: 74 70 6c 61 74 65 00 00   .BYTE $74,$70,$6c,$61,$74,$65,$00,$00  ; tplate..
9028: 01 34 34 12 12 12 12 11   .BYTE $01,$34,$34,$12,$12,$12,$12,$11  ; .44.....
9030: 12 12 12 34 ff ff         .BYTE $12,$12,$12,$34,$ff,$ff          ; ...4..

9036: 03 38 00  JunaisSword     .BYTE $03,$38,$00                      ; .8.
9039: 7f 0c 14 4a 75 6e 61 69   .BYTE $7f,$0c,$14,$4a,$75,$6e,$61,$69  ; ...Junai
9041: 27 73 20 53 77 6f 72 64   .BYTE $27,$73,$20,$53,$77,$6f,$72,$64  ; 's Sword
9049: 00 88 ff a1 ff 01 00 1a   .BYTE $00,$88,$ff,$a1,$ff,$01,$00,$1a  ; ........
9051: 00 00 92 45 00 01 00 01   .BYTE $00,$00,$92,$45,$00,$01,$00,$01  ; ...E....
9059: 00 00 ff 00 00 2a 00 00   .BYTE $00,$00,$ff,$00,$00,$2a,$00,$00  ; .....*..
9061: 00 00 00 00 22 22 00 10   .BYTE $00,$00,$00,$00,$22,$22,$00,$10  ; ....""..
9069: 10 ff ff 90 24            .BYTE $10,$ff,$ff,$90,$24              ; ....$

906e: 07 21 01  Loadstone       .BYTE $07,$21,$01                      ; .!.
9071: 00 ff 10 4c 6f 61 64 73   .BYTE $00,$ff,$10,$4c,$6f,$61,$64,$73  ; ...Loads
9079: 74 6f 6e 65 00 88 ff 02   .BYTE $74,$6f,$6e,$65,$00,$88,$ff,$02  ; tone....
9081: 01 01 00 00 00 00 01 02   .BYTE $01,$01,$00,$00,$00,$00,$01,$02  ; ........
9089: 80 01 00 01 00 00         .BYTE $80,$01,$00,$01,$00,$00          ; ......

908f: 10 28 00  IronPalmSalve   .BYTE $10,$28,$00                      ; .(.
9092: 00 00 16 49 72 6f 6e 20   .BYTE $00,$00,$16,$49,$72,$6f,$6e,$20  ; ...Iron
909a: 50 61 6c 6d 20 53 61 6c   .BYTE $50,$61,$6c,$6d,$20,$53,$61,$6c  ; Palm Sal
90a2: 76 65 00 88 ff 04 01 01   .BYTE $76,$65,$00,$88,$ff,$04,$01,$01  ; ve......
90aa: 00 00 00 00 81 00 01 01   .BYTE $00,$00,$00,$00,$81,$00,$01,$01  ; ........
90b2: 00 20 00 00 01            .BYTE $00,$20,$00,$00,$01              ; . ...

90b7: 03 2d 00  SwordOfAdept    .BYTE $03,$2d,$00                      ; .-.
90ba: 00 0a 19 53 77 6f 72 64   .BYTE $00,$0a,$19,$53,$77,$6f,$72,$64  ; ...Sword
90c2: 20 6f 66 20 54 68 65 20   .BYTE $20,$6f,$66,$20,$54,$68,$65,$20  ;  of The
90ca: 41 64 65 70 74 00 00 ff   .BYTE $41,$64,$65,$70,$74,$00,$00,$ff  ; Adept...
90d2: 00 00 27 00 00 00 00 00   .BYTE $00,$00,$27,$00,$00,$00,$00,$00  ; ..'.....
90da: 00 00 00 00 10 10 ff ff   .BYTE $00,$00,$00,$00,$10,$10,$ff,$ff  ; ........
90e2: 98 50                     .BYTE $98,$50                          ; .P

90e4: 03 24 00  RazorIce        .BYTE $03,$24,$00                      ; .$.
90e7: 00 07 10 52 61 7a 6f 72   .BYTE $00,$07,$10,$52,$61,$7a,$6f,$72  ; ...Razor
90ef: 20 49 63 65 00 00 ff 00   .BYTE $20,$49,$63,$65,$00,$00,$ff,$00  ;  Ice....
90f7: 00 27 00 00 00 00 00 00   .BYTE $00,$27,$00,$00,$00,$00,$00,$00  ; .'......
90ff: 00 00 18 00 00 20 20 90   .BYTE $00,$00,$18,$00,$00,$20,$20,$90  ; .....  .
9107: 50                        .BYTE $50                              ; P

9108: 18 15 00  Whetstone       .BYTE $18,$15,$00                      ; ...
910b: 00 00 10 57 68 65 74 73   .BYTE $00,$00,$10,$57,$68,$65,$74,$73  ; ...Whets
9113: 74 6f 6e 65 00 00 00 00   .BYTE $74,$6f,$6e,$65,$00,$00,$00,$00  ; tone....
911b: 01 10                     .BYTE $01,$10                          ; ..

911d: 10 37 00  SaurianBrandy   .BYTE $10,$37,$00                      ; .7.
9120: 00 02 15 53 61 75 72 69   .BYTE $00,$02,$15,$53,$61,$75,$72,$69  ; ...Sauri
9128: 61 6e 20 42 72 61 6e 64   .BYTE $61,$6e,$20,$42,$72,$61,$6e,$64  ; an Brand
9130: 79 00 88 ff 44 01 01 00   .BYTE $79,$00,$88,$ff,$44,$01,$01,$00  ; y...D...
9138: 00 00 00 01 97 00 01 00   .BYTE $00,$00,$00,$01,$97,$00,$01,$00  ; ........
9140: ff 00 88 ff 44 01 01 00   .BYTE $ff,$00,$88,$ff,$44,$01,$01,$00  ; ....D...
9148: 00 00 00 81 4a 00 01 00   .BYTE $00,$00,$00,$81,$4a,$00,$01,$00  ; ....J...
9150: 01 00 00 0a               .BYTE $01,$00,$00,$0a                  ; ....

9154: 03 2c 00  BluePearlDaggr  .BYTE $03,$2c,$00                      ; .,.
9157: 7f 02 18 42 6c 75 65 20   .BYTE $7f,$02,$18,$42,$6c,$75,$65,$20  ; ...Blue
915f: 50 65 61 72 6c 20 44 61   .BYTE $50,$65,$61,$72,$6c,$20,$44,$61  ; Pearl Da
9167: 67 67 65 72 00 00 ff 00   .BYTE $67,$67,$65,$72,$00,$00,$ff,$00  ; gger....
916f: 00 33 00 00 00 00 00 00   .BYTE $00,$33,$00,$00,$00,$00,$00,$00  ; .3......
9177: 00 16 00 10 10 20 20 12   .BYTE $00,$16,$00,$10,$10,$20,$20,$12  ; .....  .
917f: 08                        .BYTE $08                              ; .

9180: 10 35 00  SixPack         .BYTE $10,$35,$00                      ; .5.
9183: 00 04 13 53 69 78 20 70   .BYTE $00,$04,$13,$53,$69,$78,$20,$70  ; ...Six p
918b: 61 63 6b 20 5b 36 5d 00   .BYTE $61,$63,$6b,$20,$5b,$36,$5d,$00  ; ack [6].
9193: 88 ff 44 01 01 00 00 00   .BYTE $88,$ff,$44,$01,$01,$00,$00,$00  ; ..D.....
919b: 00 81 96 00 03 02 08 00   .BYTE $00,$81,$96,$00,$03,$02,$08,$00  ; ........
91a3: 88 ff 04 01 01 00 00 00   .BYTE $88,$ff,$04,$01,$01,$00,$00,$00  ; ........
91ab: 00 91 10 80 01 00 01 00   .BYTE $00,$91,$10,$80,$01,$00,$01,$00  ; ........
91b3: 00 06                     .BYTE $00,$06                          ; ..

91b5: 04 23 00  MelvinsHelm     .BYTE $04,$23,$00                      ; .#.
91b8: 00 12 14 4d 65 6c 76 69   .BYTE $00,$12,$14,$4d,$65,$6c,$76,$69  ; ...Melvi
91c0: 6e 27 73 20 48 65 6c 6d   .BYTE $6e,$27,$73,$20,$48,$65,$6c,$6d  ; n's Helm
91c8: 00 00 00 0f 0f 0f 0f 0f   .BYTE $00,$00,$00,$0f,$0f,$0f,$0f,$0f  ; ........
91d0: 0f 0f 0f 0f 0f 0f ff ff   .BYTE $0f,$0f,$0f,$0f,$0f,$0f,$ff,$ff  ; ........

91d8: 07 36 00  AmethystRod     .BYTE $07,$36,$00                      ; .6.
91db: 00 01 13 41 6d 65 74 68   .BYTE $00,$01,$13,$41,$6d,$65,$74,$68  ; ...Ameth
91e3: 79 73 74 20 52 6f 64 00   .BYTE $79,$73,$74,$20,$52,$6f,$64,$00  ; yst Rod.
91eb: 88 ff 44 01 04 00 dd fa   .BYTE $88,$ff,$44,$01,$04,$00,$dd,$fa  ; ..D.....
91f3: 00 d1 88 00 01 00 fd 00   .BYTE $00,$d1,$88,$00,$01,$00,$fd,$00  ; ........
91fb: 88 00 04 01 01 00 00 00   .BYTE $88,$00,$04,$01,$01,$00,$00,$00  ; ........
9203: 00 e1 88 00 01 00 02 00   .BYTE $00,$e1,$88,$00,$01,$00,$02,$00  ; ........
920b: 00 02 ff                  .BYTE $00,$02,$ff                      ; ...

920e: 18 15 00  MapStone        .BYTE $18,$15,$00                      ; ...
9211: 00 00 10 4d 61 70 20 53   .BYTE $00,$00,$10,$4d,$61,$70,$20,$53  ; ...Map S
9219: 74 6f 6e 65 00 00 00 00   .BYTE $74,$6f,$6e,$65,$00,$00,$00,$00  ; tone....
9221: 01 08                     .BYTE $01,$08                          ; ..

9223: 02 28 00  FlameQuarrels   .BYTE $02,$28,$00                      ; .(.
9226: 00 01 1a 46 6c 61 6d 65   .BYTE $00,$01,$1a,$46,$6c,$61,$6d,$65  ; ...Flame
922e: 20 51 75 61 72 72 65 6c   .BYTE $20,$51,$75,$61,$72,$72,$65,$6c  ;  Quarrel
9236: 73 20 5b 31 30 5d 00 00   .BYTE $73,$20,$5b,$31,$30,$5d,$00,$00  ; s [10]..
923e: 03 0a 00 2a 00 00 24 00   .BYTE $03,$0a,$00,$2a,$00,$00,$24,$00  ; ...*..$.
9246: 00 00 00 00 00            .BYTE $00,$00,$00,$00,$00              ; .....

924b: 02 2a 00  ThundrQuarrels  .BYTE $02,$2a,$00                      ; .*.
924e: 00 01 1c 54 68 75 6e 64   .BYTE $00,$01,$1c,$54,$68,$75,$6e,$64  ; ...Thund
9256: 65 72 20 51 75 61 72 72   .BYTE $65,$72,$20,$51,$75,$61,$72,$72  ; er Quarr
925e: 65 6c 73 20 5b 31 30 5d   .BYTE $65,$6c,$73,$20,$5b,$31,$30,$5d  ; els [10]
9266: 00 00 03 0a 00 2a 00 00   .BYTE $00,$00,$03,$0a,$00,$2a,$00,$00  ; .....*..
926e: 00 00 18 00 00 00 00      .BYTE $00,$00,$18,$00,$00,$00,$00      ; .......

9275: 03 29 00  StaffOfAmber    .BYTE $03,$29,$00                      ; .).
9278: 00 07 15 53 74 61 66 66   .BYTE $00,$07,$15,$53,$74,$61,$66,$66  ; ...Staff
9280: 20 6f 66 20 41 6d 62 65   .BYTE $20,$6f,$66,$20,$41,$6d,$62,$65  ;  of Ambe
9288: 72 00 00 ff 00 24 00 24   .BYTE $72,$00,$00,$ff,$00,$24,$00,$24  ; r....$.$
9290: 00 00 00 00 00 00 00 00   .BYTE $00,$00,$00,$00,$00,$00,$00,$00  ; ........
9298: 00 00 ff ff da ff         .BYTE $00,$00,$ff,$ff,$da,$ff          ; ......

929e: 05 36 00  RobinsHood      .BYTE $05,$36,$00                      ; .6.
92a1: 00 01 13 52 6f 62 69 6e   .BYTE $00,$01,$13,$52,$6f,$62,$69,$6e  ; ...Robin
92a9: 27 73 20 48 6f 6f 64 00   .BYTE $27,$73,$20,$48,$6f,$6f,$64,$00  ; 's Hood.
92b1: 88 ff 04 01 01 00 00 00   .BYTE $88,$ff,$04,$01,$01,$00,$00,$00  ; ........
92b9: 00 81 84 00 02 09 01 00   .BYTE $00,$81,$84,$00,$02,$09,$01,$00  ; ........
92c1: 88 ff 08 01 01 00 00 00   .BYTE $88,$ff,$08,$01,$01,$00,$00,$00  ; ........
92c9: 00 91 84 00 02 09 01 00   .BYTE $00,$91,$84,$00,$02,$09,$01,$00  ; ........
92d1: 00 06 01                  .BYTE $00,$06,$01                      ; ...

92d4: 07 36 00  GoldenApple     .BYTE $07,$36,$00                      ; .6.
92d7: 00 07 13 47 6f 6c 64 65   .BYTE $00,$07,$13,$47,$6f,$6c,$64,$65  ; ...Golde
92df: 6e 20 41 70 70 6c 65 00   .BYTE $6e,$20,$41,$70,$70,$6c,$65,$00  ; n Apple.
92e7: 88 ff 01 ff 01 00 00 00   .BYTE $88,$ff,$01,$ff,$01,$00,$00,$00  ; ........
92ef: 00 01 02 80 01 00 10 00   .BYTE $00,$01,$02,$80,$01,$00,$10,$00  ; ........
92f7: 88 ff 41 01 01 00 00 00   .BYTE $88,$ff,$41,$01,$01,$00,$00,$00  ; ..A.....
92ff: 00 82 45 00 02 02 0f 00   .BYTE $00,$82,$45,$00,$02,$02,$0f,$00  ; ..E.....
9307: 00 02 ff                  .BYTE $00,$02,$ff                      ; ...

930a: 03 2b 00  GaussRifle      .BYTE $03,$2b,$00                      ; .+.
930d: 00 07 17 47 61 75 73 73   .BYTE $00,$07,$17,$47,$61,$75,$73,$73  ; ...Gauss
9315: 20 52 69 66 6c 65 20 5b   .BYTE $20,$52,$69,$66,$6c,$65,$20,$5b  ;  Rifle [
931d: 39 35 5d 00 00 06 5f 48   .BYTE $39,$35,$5d,$00,$00,$06,$5f,$48  ; 95]..._H
9325: 48 00 00 00 00 00 00 00   .BYTE $48,$00,$00,$00,$00,$00,$00,$00  ; H.......
932d: 00 00 18 18 30 30 45 00   .BYTE $00,$00,$18,$18,$30,$30,$45,$00  ; ....00E.

9335: 04 40 00  SolarSuit       .BYTE $04,$40,$00                      ; .@.
9338: 00 12 11 53 6f 6c 61 72   .BYTE $00,$12,$11,$53,$6f,$6c,$61,$72  ; ...Solar
9340: 20 53 75 69 74 00 88 ff   .BYTE $20,$53,$75,$69,$74,$00,$88,$ff  ;  Suit...
9348: 04 01 01 00 00 00 00 e1   .BYTE $04,$01,$01,$00,$00,$00,$00,$e1  ; ........
9350: 88 00 01 00 04 00 88 ff   .BYTE $88,$00,$01,$00,$04,$00,$88,$ff  ; ........
9358: 04 01 01 00 00 00 00 d1   .BYTE $04,$01,$01,$00,$00,$00,$00,$d1  ; ........
9360: 88 00 01 00 fb 00 00 01   .BYTE $88,$00,$01,$00,$fb,$00,$00,$01  ; ........
9368: 00 00 00 00 f0 00 ff 00   .BYTE $00,$00,$00,$00,$f0,$00,$ff,$00  ; ........
9370: 00 00 00 20 20            .BYTE $00,$00,$00,$20,$20              ; ...

9375: 03 2b 00  BeamWeapon      .BYTE $03,$2b,$00                      ; .+.
9378: 00 07 17 42 65 61 6d 20   .BYTE $00,$07,$17,$42,$65,$61,$6d,$20  ; ...Beam
9380: 57 65 61 70 6f 6e 20 5b   .BYTE $57,$65,$61,$70,$6f,$6e,$20,$5b  ; Weapon [
9388: 32 35 5d 00 00 05 19 00   .BYTE $32,$35,$5d,$00,$00,$05,$19,$00  ; 25].....
9390: 00 00 00 18 00 58 00 00   .BYTE $00,$00,$00,$18,$00,$58,$00,$00  ; .....X..
9398: 00 00 08 0c 30 30 05 ff   .BYTE $00,$00,$08,$0c,$30,$30,$05,$ff  ; ....00..

93a0: 72 7c bc  CardTomeAdrs    .BYTE $72,$7c,$bc                      ; 32 bytes: 22 addresses: Scrolls, Cards & Tomes
93a3: 7c 05 7d 4a 7d 62 7d 81   .BYTE $7c,$05,$7d,$4a,$7d,$62,$7d,$81  ;     0: $7c72 [ScrlFrostblade]
93ab: 7d e6 78 0e 79 56 79 84   .BYTE $7d,$e6,$78,$0e,$79,$56,$79,$84  ;     1: $7cbc [ScrlFireblade]
93b3: 79 a9 79 cd 79 f8 79 20   .BYTE $79,$a9,$79,$cd,$79,$f8,$79,$20  ;     2: $7d05 [ScrlClout]
93bb: 7a 55 7a 7f 7a c5 7a 01   .BYTE $7a,$55,$7a,$7f,$7a,$c5,$7a,$01  ;     3: $7d4a [ScrlRenew]
93c3: 7b 2a 7b e1 7e 0b 7f 39   .BYTE $7b,$2a,$7b,$e1,$7e,$0b,$7f,$39  ;     4: $7d62 [ScrlRemovCurse]
93cb: 7f                        .BYTE $7f                              ;     5: $7d81 [ScrlWizardEye]
                                                                       ;     6: $78e6 [CrdTheStar]
                                                                       ;     7: $790e [CrdTheFool]
                                                                       ;     8: $7956 [CrdHeirophant]
                                                                       ;     9: $7984 [CrdDeath]
                                                                       ;    10: $79a9 [CrdAceOfCups]
                                                                       ;    11: $79cd [CrdTheChariot]
                                                                       ;    12: $79f8 [CrdStrength]
                                                                       ;    13: $7a20 [CrdAceOfWands]
                                                                       ;    14: $7a55 [CrdTemperance]
                                                                       ;    15: $7a7f [CrdKingOfWands]
                                                                       ;    16: $7ac5 [CrdPageOfCups]
                                                                       ;    17: $7b01 [CrdAcePentacls]
                                                                       ;    18: $7b2a [CrdHighPrstess]
                                                                       ;    19: $7ee1 [TomeKnowledge]
                                                                       ;    20: $7f0b [TomeUndrstndng]
                                                                       ;    21: $7f39 [TomeLeadership]

93cc: 78 7b 99  WandEyeHrnAdrs  .BYTE $78,$7b,$99                      ; 32 bytes: 16 addresses: Wands, Eyes & Horns
93cf: 7b ba 7b e0 7b 0c 7c 4e   .BYTE $7b,$ba,$7b,$e0,$7b,$0c,$7c,$4e  ;     0: $7b78 [ColdWand]
93d7: 7c eb 7d 0c 7e 30 7e 55   .BYTE $7c,$eb,$7d,$0c,$7e,$30,$7e,$55  ;     1: $7b99 [FireWand]
93df: 7e 77 7e bc 7e 64 7f 88   .BYTE $7e,$77,$7e,$bc,$7e,$64,$7f,$88  ;     2: $7bba [ParalysisWand]
93e7: 7f ac 7f ce 7f            .BYTE $7f,$ac,$7f,$ce,$7f              ;     3: $7be0 [EyeVulnerablty]
                                                                       ;     4: $7c0c [LightWand]
                                                                       ;     5: $7c4e [HealingWand]
                                                                       ;     6: $7deb [RubyEye]
                                                                       ;     7: $7e0c [EmeraldEye]
                                                                       ;     8: $7e30 [SapphireEye]
                                                                       ;     9: $7e55 [AmberEye]
                                                                       ;    10: $7e77 [WizardsEye]
                                                                       ;    11: $7ebc [HypnoticEye]
                                                                       ;    12: $7f64 [BronzeHorn]
                                                                       ;    13: $7f88 [SilverHorn]
                                                                       ;    14: $7fac [GoldHorn1]
                                                                       ;    15: $7fce [GoldHorn2]

93ec: 08 86 51  WeaponShldAdrs  .BYTE $08,$86,$51                      ; 32 bytes: 15 addresses: Shields & Weapons
93ef: 86 ad 86 d5 86 31 87 79   .BYTE $86,$ad,$86,$d5,$86,$31,$87,$79  ;     0: $8608 [CrystalShield]
93f7: 87 c2 87 e5 87 0c 88 34   .BYTE $87,$c2,$87,$e5,$87,$0c,$88,$34  ;     1: $8651 [ShieldOfGalahd]
93ff: 88 56 88 8b 88 b1 88 fb   .BYTE $88,$56,$88,$8b,$88,$b1,$88,$fb  ;     2: $86ad [SpikedShield]
9407: 88 1a 89                  .BYTE $88,$1a,$89                      ;     3: $86d5 [ShieldOfMordrd]
                                                                       ;     4: $8731 [SpiritShield]
                                                                       ;     5: $8779 [IronwoodBoken]
                                                                       ;     6: $87c2 [IronFan]
                                                                       ;     7: $87e5 [TowerShield]
                                                                       ;     8: $880c [Crossbow]
                                                                       ;     9: $8834 [Quarrels]
                                                                       ;    10: $8856 [ChaosClub]
                                                                       ;    11: $888b [ShortSword]
                                                                       ;    12: $88b1 [HolyHandGrnade]
                                                                       ;    13: $88fb [Pike]
                                                                       ;    14: $891a [Dirk]

940a: 39 89 7d  ArmorAdrs       .BYTE $39,$89,$7d                      ; 32 bytes: 16 item addresses: Armor
940d: 89 c0 89 e8 89 2c 8a 4c   .BYTE $89,$c0,$89,$e8,$89,$2c,$8a,$4c  ;     0: $8939 [PantherGloves]
9415: 8a 71 8a 95 8a b6 8a d7   .BYTE $8a,$71,$8a,$95,$8a,$b6,$8a,$d7  ;     1: $897d [HelmOfLight]
941d: 8a fc 8a 21 8b 4b 8b 74   .BYTE $8a,$fc,$8a,$21,$8b,$4b,$8b,$74  ;     2: $89c0 [DragnsknHaubrk]
9425: 8b 9a 8b c2 8b            .BYTE $8b,$9a,$8b,$c2,$8b              ;     3: $89e8 [GoldenGreaves]
                                                                       ;     4: $8a2c [PlateHelm]
                                                                       ;     5: $8a4c [PlateGauntlets]
                                                                       ;     6: $8a71 [PlateLeggings]
                                                                       ;     7: $8a95 [PlateArmor]
                                                                       ;     8: $8ab6 [ScaleArmor]
                                                                       ;     9: $8ad7 [TruesilverHelm]
                                                                       ;    10: $8afc [TruesilverCoat]
                                                                       ;    11: $8b21 [TruslvrGuantlt]
                                                                       ;    12: $8b4b [TruslvrLeggngs]
                                                                       ;    13: $8b74 [CuirbouilliHlm]
                                                                       ;    14: $8b9a [BronzeBrstplt]
                                                                       ;    15: $8bc2 [BronzeBracers]

942a: e6 8b 01  ApparelAdrs     .BYTE $e6,$8b,$01                      ; 32 bytes: 16 item addresses: Clothing
942d: 8c 1c 8c 30 8c 85 8c ba   .BYTE $8c,$1c,$8c,$30,$8c,$85,$8c,$ba  ;     0: $8be6 [WhiteLinenShrt]
9435: 8c f0 8c 0a 8d 29 8d 49   .BYTE $8c,$f0,$8c,$0a,$8d,$29,$8d,$49  ;     1: $8c01 [BlckSilkKimono]
943d: 8d 61 8d 7f 8d 97 8d b3   .BYTE $8d,$61,$8d,$7f,$8d,$97,$8d,$b3  ;     2: $8c1c [CheapRobe]
9445: 8d d1 8d 06 8e            .BYTE $8d,$d1,$8d,$06,$8e              ;     3: $8c30 [ElvenCloak]
                                                                       ;     4: $8c85 [ElvenBoots]
                                                                       ;     5: $8cba [CrystalBelt]
                                                                       ;     6: $8cf0 [BlueSuedeShoes]
                                                                       ;     7: $8d0a [BlckWlnBreechs]
                                                                       ;     8: $8d29 [SlvrBrcdBodice]
                                                                       ;     9: $8d49 [RedPlaidKilt]
                                                                       ;    10: $8d61 [GldSilkPntalns]
                                                                       ;    11: $8d7f [LeatherJerkin]
                                                                       ;    12: $8d97 [FlppyLeathrHat]
                                                                       ;    13: $8db3 [BlckCottnPrtlt]
                                                                       ;    14: $8dd1 [SilverSash]
                                                                       ;    15: $8e06 [StealthSuit]

944a: f0 7f 3b  PotionAdrs      .BYTE $f0,$7f,$3b                      ; 48 bytes: 24 item addresses: Potions
944d: 80 85 80 d3 80 1d 81 48   .BYTE $80,$85,$80,$d3,$80,$1d,$81,$48  ;     0: $7ff0 [PtnFleetness]
9455: 81 94 81 e0 81 2c 82 76   .BYTE $81,$94,$81,$e0,$81,$2c,$82,$76  ;     1: $803b [PtnStrength]
945d: 82 c1 82 0d 83 4b 83 98   .BYTE $82,$c1,$82,$0d,$83,$4b,$83,$98  ;     2: $8085 [PtnIntellignce]
9465: 83 e3 83 10 84 7c 84 c7   .BYTE $83,$e3,$83,$10,$84,$7c,$84,$c7  ;     3: $80d3 [PtnCharisma]
946d: 84 15 85 31 85 4c 85 79   .BYTE $84,$15,$85,$31,$85,$4c,$85,$79  ;     4: $811d [PtnEndurance]
9475: 85 a2 85 db 85            .BYTE $85,$a2,$85,$db,$85              ;     5: $8148 [PtnInvBlunt]
                                                                       ;     6: $8194 [PtnInvSharp]
                                                                       ;     7: $81e0 [PtnInvSharp]
                                                                       ;     8: $822c [PtnInvAir]
                                                                       ;     9: $8276 [PtnInvFire]
                                                                       ;    10: $82c1 [PtnInvWater]
                                                                       ;    11: $830d [PtnRegenration]
                                                                       ;    12: $834b [PtnInvMental]
                                                                       ;    13: $8398 [PtnInvCold]
                                                                       ;    14: $83e3 [PtnFruitJuice]
                                                                       ;    15: $8410 [PtnWizardEye]
                                                                       ;    16: $847c [PtnDexterity]
                                                                       ;    17: $84c7 [PtnInfraVision]
                                                                       ;    18: $8515 [PtnCleansing]
                                                                       ;    19: $8531 [PtnAntidote]
                                                                       ;    20: $854c [PtnRestoration]
                                                                       ;    21: $8579 [PtnHealing]
                                                                       ;    22: $85a2 [PtnHemlock]
                                                                       ;    23: $85db [PtnInebriation]

947a: a0 cc ec  CategryTbls_L   .BYTE $a0,$cc,$ec    ; 6 bytes: LSB of address of item category table
947d: 0a 2a 4a                  .BYTE $0a,$2a,$4a    ;

9480: 93 93 93  CategryTbls_H   .BYTE $93,$93,$93    ; 6 bytes: MSB of address of item category table
9483: 94 94 94                  .BYTE $94,$94,$94    ;     0: $93a0 [CardTomeAdrs]   22 items: Scrolls & Cards
                                                     ;     1: $93cc [WandEyeHrnAdrs] 16 items: Wands, Eyes & Horns
                                                     ;     2: $93ec [WeaponShldAdrs] 15 items: Shields & Weapons
                                                     ;     3: $940a [ArmorAdrs]      16 items: Armor
                                                     ;     4: $942a [ApparelAdrs]    16 items: Clothing
                                                     ;     5: $944a [PotionAdrs]     24 items: Potions

9486: e6 6f 4c  TreasureAdr_L   .BYTE $e6,$6f,$4c                      ; 32 bytes: LSB of address of
9489: a7 7d fc d0 0d c5 36 9e   .BYTE $a7,$7d,$fc,$d0,$0d,$c5,$36,$9e  ;           special loc treasure 0..31
9491: 84 8f 84 b7 e4 08 1d 54   .BYTE $84,$8f,$84,$b7,$e4,$08,$1d,$54  ;
9499: 80 b5 0c d8 0e 23 4b 75   .BYTE $80,$b5,$0c,$d8,$0e,$23,$4b,$75  ;
94a1: 6e d4 0a 35 75            .BYTE $6e,$d4,$0a,$35,$75              ;

94a6: 78 8f 85  TreasureAdr_H   .BYTE $78,$8f,$85                      ; 32 bytes: MSB of address of
94a9: 8f 89 8a 8f 90 7a 90 92   .BYTE $8f,$89,$8a,$8f,$90,$7a,$90,$92  ;           special loc treasure 0..31
94b1: 79 90 79 90 90 91 91 91   .BYTE $79,$90,$79,$90,$90,$91,$91,$91  ;     0: $78e6 [CrdTheStar]
94b9: 91 91 88 91 92 92 92 92   .BYTE $91,$91,$88,$91,$92,$92,$92,$92  ;     1: $8f6f [WingedSandals]
94c1: 90 92 93 93 93            .BYTE $90,$92,$93,$93,$93              ;     2: $854c [PtnRestoration]
                                                                       ;     3: $8fa7 [MorganasTiara]
                                                                       ;     4: $897d [HelmOfLight]
                                                                       ;     5: $8afc [TruesilverCoat]
                                                                       ;     6: $8fd0 [CloakLevitatn]
                                                                       ;     7: $900d [CrystalBrstplt]
                                                                       ;     8: $7ac5 [CrdPageOfCups]
                                                                       ;     9: $9036 [JunaisSword]
                                                                       ;    10: $929e [RobinsHood]
                                                                       ;    11: $7984 [CrdDeath]
                                                                       ;    12: $908f [IronPalmSalve]
                                                                       ;    13: $7984 [CrdDeath]
                                                                       ;    14: $90b7 [SwordOfAdept]
                                                                       ;    15: $90e4 [RazorIce]
                                                                       ;    16: $9108 [Whetstone]
                                                                       ;    17: $911d [SaurianBrandy]
                                                                       ;    18: $9154 [BluePearlDaggr]
                                                                       ;    19: $9180 [SixPack]
                                                                       ;    20: $91b5 [MelvinsHelm]
                                                                       ;    21: $880c [Crossbow]
                                                                       ;    22: $91d8 [AmethystRod]
                                                                       ;    23: $920e [MapStone]
                                                                       ;    24: $9223 [FlameQuarrels]
                                                                       ;    25: $924b [ThundrQuarrels]
                                                                       ;    26: $9275 [StaffOfAmber]
                                                                       ;    27: $906e [Loadstone]
                                                                       ;    28: $92d4 [GoldenApple]
                                                                       ;    29: $930a [GaussRifle]
                                                                       ;    30: $9335 [SolarSuit]
                                                                       ;    31: $9375 [BeamWeapon]

94c6: 3c 50 6a  dat_94c6_L      .BYTE $3c,$50,$6a          ; 8 bytes: LSB of address of special/quest item
94c9: 83 98 ba 04 4b            .BYTE $83,$98,$ba,$04,$4b  ;          (not referenced, dup of QuestItem_L)

94ce: 8e 8e 8e  dat_94ce_H      .BYTE $8e,$8e,$8e          ; 8 bytes: MSB of address of special/quest item
94d1: 8e 8e 8e 8f 8f            .BYTE $8e,$8e,$8e,$8f,$8f  ;          (not referenced, dup of QuestItem_H)
                                                           ;     0: $8e3c [SilverKey]
                                                           ;     1: $8e50 [GoblinRingHalf]
                                                           ;     2: $8e6a [TrollRingHalf]
                                                           ;     3: $8e83 [StaffPiece]
                                                           ;     4: $8e98 [PacCard]
                                                           ;     5: $8eba [MirrorShield]
                                                           ;     6: $8f04 [ReforgedRing]
                                                           ;     7: $8f4b [Bloodstone]

94d6: 10 20 30  CardTomePrbs    .BYTE $10,$20,$30                      ; 22 bytes: Probability table for items
94d9: 40 58 70 7a 84 8e 92 96   .BYTE $40,$58,$70,$7a,$84,$8e,$92,$96  ;           in CardTomeAdrs
94e1: 9a 9e a6 b6 ba ca e0 f0   .BYTE $9a,$9e,$a6,$b6,$ba,$ca,$e0,$f0  ;     0: $10 (ScrlFrostblade: 6.64%)
94e9: f4 f8 ff                  .BYTE $f4,$f8,$ff                      ;     1: $20 (ScrlFireblade:  6.25%)
                                                                       ;     2: $30 (ScrlClout:      6.25%)
                                                                       ;     3: $40 (ScrlRenew:      6.25%)
                                                                       ;     4: $58 (ScrlRemovCurse: 9.38%)
                                                                       ;     5: $70 (ScrlWizardEye:  9.38%)
                                                                       ;     6: $7a (CrdTheStar:     3.91%)
                                                                       ;     7: $84 (CrdTheFool:     3.91%)
                                                                       ;     8: $8e (CrdHeirophant:  3.91%)
                                                                       ;     9: $92 (CrdDeath:       1.56%)
                                                                       ;    10: $96 (CrdAceOfCups:   1.56%)
                                                                       ;    11: $9a (CrdTheChariot:  1.56%)
                                                                       ;    12: $9e (CrdStrength:    1.56%)
                                                                       ;    13: $a6 (CrdAceOfWands:  3.13%)
                                                                       ;    14: $b6 (CrdTemperance:  6.25%)
                                                                       ;    15: $ba (CrdKingOfWands: 1.56%)
                                                                       ;    16: $ca (CrdPageOfCups:  6.25%)
                                                                       ;    17: $e0 (CrdAcePentacls: 8.59%)
                                                                       ;    18: $f0 (CrdHighPrstess: 6.25%)
                                                                       ;    19: $f4 (TomeKnowledge:  1.56%)
                                                                       ;    20: $f8 (TomeUndrstndng: 1.56%)
                                                                       ;    21: $ff (TomeLeadership: 2.73%)


94ec: 08 18 28  WandEyeHrnPrbs  .BYTE $08,$18,$28                      ; 16 bytes: Probability table for items
94ef: 40 50 68 70 78 80 88 98   .BYTE $40,$50,$68,$70,$78,$80,$88,$98  ;           in WandEyeHrnAdrs
94f7: a8 b4 c0 e0 ff            .BYTE $a8,$b4,$c0,$e0,$ff              ;     0: $08 (ColdWand:       3.51%)
                                                                       ;     1: $18 (FireWand:       6.25%)
                                                                       ;     2: $28 (ParalysisWand:  6.25%)
                                                                       ;     3: $40 (EyeVulnerablty: 9.38%)
                                                                       ;     4: $50 (LightWand:      6.25%)
                                                                       ;     5: $68 (HealingWand:    9.38%)
                                                                       ;     6: $70 (RubyEye:        3.13%)
                                                                       ;     7: $78 (EmeraldEye:     3.13%)
                                                                       ;     8: $80 (SapphireEye:    3.13%)
                                                                       ;     9: $88 (AmberEye:       3.13%)
                                                                       ;    10: $98 (WizardsEye:     6.25%)
                                                                       ;    11: $a8 (HypnoticEye:    6.25%)
                                                                       ;    12: $b4 (BronzeHorn:     4.69%)
                                                                       ;    13: $c0 (SilverHorn:     4.69%)
                                                                       ;    14: $e0 (GoldHorn1:     12.50%)
                                                                       ;    15: $ff (GoldHorn2:     12.11%)

94fc: 04 08 20  WeaponShldPrbs  .BYTE $04,$08,$20                      ; 15 bytes: Probability table for items
94ff: 24 28 38 40 60 70 80 90   .BYTE $24,$28,$38,$40,$60,$70,$80,$90  ;           in WeaponShldAdrs
9507: a8 c0 d8 ff               .BYTE $a8,$c0,$d8,$ff                  ;     0: $04 (CrystalShield:   1.95%)
                                                                       ;     1: $08 (ShieldOfGalahd:  1.56%)
                                                                       ;     2: $20 (SpikedShield:    9.38%)
                                                                       ;     3: $24 (ShieldOfMordrd:  1.56%)
                                                                       ;     4: $28 (SpiritShield:    1.56%)
                                                                       ;     5: $38 (IronwoodBoken:   6.25%)
                                                                       ;     6: $40 (IronFan:         3.13%)
                                                                       ;     7: $60 (TowerShield:    12.50%)
                                                                       ;     8: $70 (Crossbow:        6.25%)
                                                                       ;     9: $80 (Quarrels:        6.25%)
                                                                       ;    10: $90 (ChaosClub:       6.25%)
                                                                       ;    11: $a8 (ShortSword:     12.50%)
                                                                       ;    12: $c0 (HolyHandGrnade: 12.50%)
                                                                       ;    13: $d8 (Pike:           12.50%)
                                                                       ;    14: $ff (Dirk:           15.23%)

950b: 04 08 0c  ArmorPrbs       .BYTE $04,$08,$0c                      ; 16 bytes: Probability table for items
950e: 10 30 50 70 90 b0 b4 b8   .BYTE $10,$30,$50,$70,$90,$b0,$b4,$b8  ;           in ArmorAdrs
9516: bc c0 e0 f0 ff            .BYTE $bc,$c0,$e0,$f0,$ff              ;     0: $04 (PantherGloves:   1.95%)
                                                                       ;     1: $08 (HelmOfLight:     1.56%)
                                                                       ;     2: $0c (DragnsknHaubrk:  1.56%)
                                                                       ;     3: $10 (GoldenGreaves:   1.56%)
                                                                       ;     4: $30 (PlateHelm:      12.50%)
                                                                       ;     5: $50 (PlateGauntlets: 12.50%)
                                                                       ;     6: $70 (PlateLeggings:  12.50%)
                                                                       ;     7: $90 (PlateArmor:     12.50%)
                                                                       ;     8: $b0 (ScaleArmor:     12.50%)
                                                                       ;     9: $b4 (TruesilverHelm:  1.56%)
                                                                       ;    10: $b8 (TruesilverCoat:  1.56%)
                                                                       ;    11: $bc (TruslvrGuantlt:  1.56%)
                                                                       ;    12: $c0 (TruslvrLeggngs:  1.56%)
                                                                       ;    13: $e0 (CuirbouilliHlm: 12.50%)
                                                                       ;    14: $f0 (BronzeBrstplt:   6.25%)
                                                                       ;    15: $ff (BronzeBracers:   5.86%)

951b: 10 20 50  ApparelPrbs     .BYTE $10,$20,$50                      ; 16 bytes: Probability table for items
951e: 54 5c 60 68 78 88 9c ac   .BYTE $54,$5c,$60,$68,$78,$88,$9c,$ac  ;           in ApparelAdrs
9526: c4 dc f4 fc ff            .BYTE $c4,$dc,$f4,$fc,$ff              ;     0: $10 (WhiteLinenShrt:  6.64%)
                                                                       ;     1: $20 (BlckSilkKimono:  6.25%)
                                                                       ;     2: $50 (CheapRobe:      18.75%)
                                                                       ;     3: $54 (ElvenCloak:      1.56%)
                                                                       ;     4: $5c (ElvenBoots:      3.13%)
                                                                       ;     5: $60 (CrystalBelt:     1.56%)
                                                                       ;     6: $68 (BlueSuedeShoes:  3.13%)
                                                                       ;     7: $78 (BlckWlnBreechs:  6.25%)
                                                                       ;     8: $88 (SlvrBrcdBodice:  6.25%)
                                                                       ;     9: $9c (RedPlaidKilt:    7.81%)
                                                                       ;    10: $ac (GldSilkPntalns:  6.25%)
                                                                       ;    11: $c4 (LeatherJerkin:   9.38%)
                                                                       ;    12: $dc (FlppyLeathrHat:  9.38%)
                                                                       ;    13: $f4 (BlckCottnPrtlt:  9.38%)
                                                                       ;    14: $fc (SilverSash:      3.13%)
                                                                       ;    15: $ff (StealthSuit:     1.17%)

952b: 10 20 30  PotionPrbs      .BYTE $10,$20,$30                      ; 24 bytes: Probability table for items
952e: 40 50 52 54 56 58 5a 5c   .BYTE $40,$50,$52,$54,$56,$58,$5a,$5c  ;           in PotionAdrs
9536: 64 66 68 88 90 a0 a8 ac   .BYTE $64,$66,$68,$88,$90,$a0,$a8,$ac  ;     0: $10 (PtnFleetness:    6.64%)
953e: b0 c0 e0 f0 ff            .BYTE $b0,$c0,$e0,$f0,$ff              ;     1: $20 (PtnStrength:     6.25%)
                                                                       ;     2: $30 (PtnIntellignce:  6.25%)
                                                                       ;     3: $40 (PtnCharisma:     6.25%)
                                                                       ;     4: $50 (PtnEndurance:    6.25%)
                                                                       ;     5: $52 (PtnInvBlunt:     0.78%)
                                                                       ;     6: $54 (PtnInvSharp:     0.78%)
                                                                       ;     7: $56 (PtnInvSharp:     0.78%)
                                                                       ;     8: $58 (PtnInvAir:       0.78%)
                                                                       ;     9: $5a (PtnInvFire:      0.78%)
                                                                       ;    10: $5c (PtnInvWater:     0.78%)
                                                                       ;    11: $64 (PtnRegenration:  3.13%)
                                                                       ;    12: $66 (PtnInvMental:    0.78%)
                                                                       ;    13: $68 (PtnInvCold:      0.78%)
                                                                       ;    14: $88 (PtnFruitJuice:  12.50%)
                                                                       ;    15: $90 (PtnWizardEye:    3.13%)
                                                                       ;    16: $a0 (PtnDexterity:    6.25%)
                                                                       ;    17: $a8 (PtnInfraVision:  3.13%)
                                                                       ;    18: $ac (PtnCleansing:    1.56%)
                                                                       ;    19: $b0 (PtnAntidote:     1.56%)
                                                                       ;    20: $c0 (PtnRestoration:  6.25%)
                                                                       ;    21: $e0 (PtnHealing:     12.50%)
                                                                       ;    22: $f0 (PtnHemlock:      6.25%)
                                                                       ;    23: $ff (PtnInebriation:  5.86%)

9543: d6 ec fc  ChanceTbls_L    .BYTE $d6,$ec,$fc    ; 6 bytes: LSB of probability table address for item categories
9546: 0b 1b 2b                  .BYTE $0b,$1b,$2b    ;

9549: 94 94 94  ChanceTbls_H    .BYTE $94,$94,$94    ; 6 bytes: MSB of probability table address for item categories
954c: 95 95 95                  .BYTE $95,$95,$95    ;     0: $94d6 [CardTomePrbs]:   Cards, Tomes
                                                     ;     1: $94ec [WandEyeHrnPrbs]: Wands, Eyes, Horns
                                                     ;     2: $94fc [WeaponShldPrbs]: Weapons & Shields
                                                     ;     3: $950b [ArmorPrbs]:      Armor
                                                     ;     4: $951b [ApparelPrbs]:    Apparel
                                                     ;     5: $952b [PotionPrbs]:     Potions

954f: 3c 50 6a  QuestItem_L     .BYTE $3c,$50,$6a          ; 8 bytes: LSB of special/quest item address
9552: 83 98 ba 04 4b            .BYTE $83,$98,$ba,$04,$4b  ;

9557: 8e 8e 8e  QuestItem_H     .BYTE $8e,$8e,$8e          ; 8 bytes: MSB of special/quest item address
955a: 8e 8e 8e 8f 8f            .BYTE $8e,$8e,$8e,$8f,$8f  ;     0: $8e3c [SilverKey]         4: $8e98 [PacCard]
                                                           ;     1: $8e50 [GoblinRingHalf]    5: $8eba [MirrorShield]
                                                           ;     2: $8e6a [TrollRingHalf]     6: $8f04 [ReforgedRing]
                                                           ;     3: $8e83 [StaffPiece]        7: $8f4b [Bloodstone]

955f: 00        GenderZts_L     .BYTE $00            ; LSB of player gender ZTS assigned by setGenderZts &
                                                     ;     displayed by StrMapStone
9560: 00        GenderZts_H     .BYTE $00            ; MSB of player gender ZTS assigned by setGenderZts &
                                                     ;     displayed by StrMapStone

9561: a8        StrClrMsgRows   .BYTE $a8                              ; {Clear all message rows}
9562: ff                        .BYTE $ff                              ; {End of string}

9563: a6 00 02  StrTrumpCard    .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
9566: a5                        .BYTE $a5                              ; {Center}
9567: 53 65 61 6c 65 64 20 69   .BYTE $53,$65,$61,$6c,$65,$64,$20,$69  ; "Sealed i"
956f: 6e 20 61 6e 20 65 6e 76   .BYTE $6e,$20,$61,$6e,$20,$65,$6e,$76  ; "n an env"
9577: 65 6c 6f 70 65 20 69 73   .BYTE $65,$6c,$6f,$70,$65,$20,$69,$73  ; "elope is"
957f: 20 61 20 74 72 75 6d 70   .BYTE $20,$61,$20,$74,$72,$75,$6d,$70  ; " a trump"
9587: 20 63 61 72 64 2e 0d      .BYTE $20,$63,$61,$72,$64,$2e,$0d      ; " card.\r"
958e: ff                        .BYTE $ff                              ; {End of string}

958f: a6 00 01  StrWingedSndls  .BYTE $a6,$00,$01                      ; {Col 0 Row 1}
9592: a5                        .BYTE $a5                              ; {Center}
9593: 41 20 70 6f 77 65 72 66   .BYTE $41,$20,$70,$6f,$77,$65,$72,$66  ; "A powerf"
959b: 75 6c 20 62 75 74 20 66   .BYTE $75,$6c,$20,$62,$75,$74,$20,$66  ; "ul but f"
95a3: 65 6d 69 6e 69 6e 65 20   .BYTE $65,$6d,$69,$6e,$69,$6e,$65,$20  ; "eminine "
95ab: 76 6f 69 63 65 20 73 61   .BYTE $76,$6f,$69,$63,$65,$20,$73,$61  ; "voice sa"
95b3: 79 73 3a 0d 0d            .BYTE $79,$73,$3a,$0d,$0d              ; "ys:\r\r"
95b8: a5                        .BYTE $a5                              ; {Center}
95b9: 22 46 6f 72 20 74 68 79   .BYTE $22,$46,$6f,$72,$20,$74,$68,$79  ; ""For thy"
95c1: 20 76 69 63 74 6f 72 79   .BYTE $20,$76,$69,$63,$74,$6f,$72,$79  ; " victory"
95c9: 20 49 20 67 69 76 65 20   .BYTE $20,$49,$20,$67,$69,$76,$65,$20  ; " I give "
95d1: 74 68 65 65 20 74 68 65   .BYTE $74,$68,$65,$65,$20,$74,$68,$65  ; "thee the"
95d9: 73 65 0d                  .BYTE $73,$65,$0d                      ; "se\r"
95dc: a5                        .BYTE $a5                              ; {Center}
95dd: 73 61 6e 64 61 6c 73 20   .BYTE $73,$61,$6e,$64,$61,$6c,$73,$20  ; "sandals "
95e5: 74 6f 20 6d 61 6b 65 20   .BYTE $74,$6f,$20,$6d,$61,$6b,$65,$20  ; "to make "
95ed: 74 68 65 65 20 71 75 69   .BYTE $74,$68,$65,$65,$20,$71,$75,$69  ; "thee qui"
95f5: 63 6b 20 61 6e 64 20 61   .BYTE $63,$6b,$20,$61,$6e,$64,$20,$61  ; "ck and a"
95fd: 67 69 6c 65 2e 22 0d      .BYTE $67,$69,$6c,$65,$2e,$22,$0d      ; "gile."\r"
9604: ff                        .BYTE $ff                              ; {End of string}

9605: a6 00 02  StrRstratnPotn  .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
9608: a5                        .BYTE $a5                              ; {Center}
9609: 41 66 74 65 72 20 73 6f   .BYTE $41,$66,$74,$65,$72,$20,$73,$6f  ; "After so"
9611: 6d 65 20 70 72 79 69 6e   .BYTE $6d,$65,$20,$70,$72,$79,$69,$6e  ; "me pryin"
9619: 67 2c 20 61 20 73 6d 61   .BYTE $67,$2c,$20,$61,$20,$73,$6d,$61  ; "g, a sma"
9621: 6c 6c 20 63 68 65 73 74   .BYTE $6c,$6c,$20,$63,$68,$65,$73,$74  ; "ll chest"
9629: 0d                        .BYTE $0d                              ; "\r"
962a: a5                        .BYTE $a5                              ; {Center}
962b: 6f 70 65 6e 73 20 74 6f   .BYTE $6f,$70,$65,$6e,$73,$20,$74,$6f  ; "opens to"
9633: 20 72 65 76 65 61 6c 20   .BYTE $20,$72,$65,$76,$65,$61,$6c,$20  ; " reveal "
963b: 61 20 70 6f 74 69 6f 6e   .BYTE $61,$20,$70,$6f,$74,$69,$6f,$6e  ; "a potion"
9643: 20 76 69 61 6c 2e 0d      .BYTE $20,$76,$69,$61,$6c,$2e,$0d      ; " vial.\r"
964a: ff                        .BYTE $ff                              ; {End of string}

964b: a6 00 02  StrMorgnsTiara  .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
964e: a5                        .BYTE $a5                              ; {Center}
964f: 59 6f 75 20 66 69 6e 64   .BYTE $59,$6f,$75,$20,$66,$69,$6e,$64  ; "You find"
9657: 20 61 20 64 61 69 6e 74   .BYTE $20,$61,$20,$64,$61,$69,$6e,$74  ; " a daint"
965f: 79 20 6c 69 74 74 6c 65   .BYTE $79,$20,$6c,$69,$74,$74,$6c,$65  ; "y little"
9667: 20 63 72 6f 77 6e 2e 0d   .BYTE $20,$63,$72,$6f,$77,$6e,$2e,$0d  ; " crown.\r"
966f: ff                        .BYTE $ff                              ; {End of string}

9670: a6 00 02  StrHelmOfLight  .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
9673: a5                        .BYTE $a5                              ; {Center}
9674: 41 20 68 65 6c 6d 20 67   .BYTE $41,$20,$68,$65,$6c,$6d,$20,$67  ; "A helm g"
967c: 6c 6f 77 69 6e 67 20 77   .BYTE $6c,$6f,$77,$69,$6e,$67,$20,$77  ; "lowing w"
9684: 69 74 68 20 72 75 6e 65   .BYTE $69,$74,$68,$20,$72,$75,$6e,$65  ; "ith rune"
968c: 73 20 66 6c 6f 61 74 73   .BYTE $73,$20,$66,$6c,$6f,$61,$74,$73  ; "s floats"
9694: 0d                        .BYTE $0d                              ; "\r"
9695: a5                        .BYTE $a5                              ; {Center}
9696: 69 6e 20 6d 69 64 61 69   .BYTE $69,$6e,$20,$6d,$69,$64,$61,$69  ; "in midai"
969e: 72 20 62 65 66 6f 72 65   .BYTE $72,$20,$62,$65,$66,$6f,$72,$65  ; "r before"
96a6: 20 79 6f 75 2e 0d         .BYTE $20,$79,$6f,$75,$2e,$0d          ; " you.\r"
96ac: ff                        .BYTE $ff                              ; {End of string}

96ad: a6 00 02  StrTruslvrCoat  .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
96b0: a5                        .BYTE $a5                              ; {Center}
96b1: 41 20 63 68 61 69 6e 2d   .BYTE $41,$20,$63,$68,$61,$69,$6e,$2d  ; "A chain-"
96b9: 6d 61 69 6c 20 63 6f 61   .BYTE $6d,$61,$69,$6c,$20,$63,$6f,$61  ; "mail coa"
96c1: 74 20 67 6c 65 65 6d 73   .BYTE $74,$20,$67,$6c,$65,$65,$6d,$73  ; "t gleems"
96c9: 20 77 69 74 68 20 61 6e   .BYTE $20,$77,$69,$74,$68,$20,$61,$6e  ; " with an"
96d1: 0d                        .BYTE $0d                              ; "\r"
96d2: a5                        .BYTE $a5                              ; {Center}
96d3: 61 6c 6d 6f 73 74 20 6d   .BYTE $61,$6c,$6d,$6f,$73,$74,$20,$6d  ; "almost m"
96db: 61 67 69 63 61 6c 20 6c   .BYTE $61,$67,$69,$63,$61,$6c,$20,$6c  ; "agical l"
96e3: 75 73 74 72 65 2e 0d      .BYTE $75,$73,$74,$72,$65,$2e,$0d      ; "ustre.\r"
96ea: ff                        .BYTE $ff                              ; {End of string}

96eb: a6 00 03  StrClkLevitatn  .BYTE $a6,$00,$03                      ; {Col 0 Row 3}
96ee: a5                        .BYTE $a5                              ; {Center}
96ef: 41 20 63 6c 6f 61 6b 20   .BYTE $41,$20,$63,$6c,$6f,$61,$6b,$20  ; "A cloak "
96f7: 64 61 6e 63 65 73 20 74   .BYTE $64,$61,$6e,$63,$65,$73,$20,$74  ; "dances t"
96ff: 6f 20 61 6e 64 20 66 72   .BYTE $6f,$20,$61,$6e,$64,$20,$66,$72  ; "o and fr"
9707: 6f 20 62 65 66 6f 72 65   .BYTE $6f,$20,$62,$65,$66,$6f,$72,$65  ; "o before"
970f: 20 79 6f 75 2e 0d         .BYTE $20,$79,$6f,$75,$2e,$0d          ; " you.\r"
9715: ff                        .BYTE $ff                              ; {End of string}

9716: a6 00 02  StrCrystlBrplt  .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
9719: a5                        .BYTE $a5                              ; {Center}
971a: 54 68 65 72 65 20 69 73   .BYTE $54,$68,$65,$72,$65,$20,$69,$73  ; "There is"
9722: 20 61 20 67 6c 69 73 74   .BYTE $20,$61,$20,$67,$6c,$69,$73,$74  ; " a glist"
972a: 65 6e 69 6e 67 20 62 72   .BYTE $65,$6e,$69,$6e,$67,$20,$62,$72  ; "ening br"
9732: 65 61 73 74 70 6c 61 74   .BYTE $65,$61,$73,$74,$70,$6c,$61,$74  ; "eastplat"
973a: 65 20 74 68 61 74 0d      .BYTE $65,$20,$74,$68,$61,$74,$0d      ; "e that\r"
9741: a5                        .BYTE $a5                              ; {Center}
9742: 6c 6f 6f 6b 73 20 61 73   .BYTE $6c,$6f,$6f,$6b,$73,$20,$61,$73  ; "looks as"
974a: 20 69 66 20 69 74 20 77   .BYTE $20,$69,$66,$20,$69,$74,$20,$77  ; " if it w"
9752: 61 73 20 6d 61 64 65 20   .BYTE $61,$73,$20,$6d,$61,$64,$65,$20  ; "as made "
975a: 6a 75 73 74 20 66 6f 72   .BYTE $6a,$75,$73,$74,$20,$66,$6f,$72  ; "just for"
9762: 20 79 6f 75 2e 0d         .BYTE $20,$79,$6f,$75,$2e,$0d          ; " you.\r"
9768: ff                        .BYTE $ff                              ; {End of string}

9769: a6 00 02  StrJunaisSword  .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
976c: a5                        .BYTE $a5                              ; {Center}
976d: 41 20 73 74 72 61 69 67   .BYTE $41,$20,$73,$74,$72,$61,$69,$67  ; "A straig"
9775: 68 74 2c 20 73 69 6e 67   .BYTE $68,$74,$2c,$20,$73,$69,$6e,$67  ; "ht, sing"
977d: 6c 65 2d 65 64 67 65 64   .BYTE $6c,$65,$2d,$65,$64,$67,$65,$64  ; "le-edged"
9785: 2c 20 65 76 69 6c 2d 6c   .BYTE $2c,$20,$65,$76,$69,$6c,$2d,$6c  ; ", evil-l"
978d: 6f 6f 6b 69 6e 67 0d      .BYTE $6f,$6f,$6b,$69,$6e,$67,$0d      ; "ooking\r"
9794: a5                        .BYTE $a5                              ; {Center}
9795: 73 77 6f 72 64 20 6f 66   .BYTE $73,$77,$6f,$72,$64,$20,$6f,$66  ; "sword of"
979d: 20 6f 72 69 65 6e 74 61   .BYTE $20,$6f,$72,$69,$65,$6e,$74,$61  ; " orienta"
97a5: 6c 20 64 65 73 69 67 6e   .BYTE $6c,$20,$64,$65,$73,$69,$67,$6e  ; "l design"
97ad: 20 6c 69 65 73 20 68 65   .BYTE $20,$6c,$69,$65,$73,$20,$68,$65  ; " lies he"
97b5: 72 65 2e 0d               .BYTE $72,$65,$2e,$0d                  ; "re.\r"
97b9: ff                        .BYTE $ff                              ; {End of string}

97ba: a6 00 02  StrLoadstone    .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
97bd: a5                        .BYTE $a5                              ; {Center}
97be: 41 20 63 75 72 69 6f 75   .BYTE $41,$20,$63,$75,$72,$69,$6f,$75  ; "A curiou"
97c6: 73 2d 6c 6f 6f 6b 69 6e   .BYTE $73,$2d,$6c,$6f,$6f,$6b,$69,$6e  ; "s-lookin"
97ce: 67 20 73 74 6f 6e 65 20   .BYTE $67,$20,$73,$74,$6f,$6e,$65,$20  ; "g stone "
97d6: 66 61 73 74 65 6e 73 0d   .BYTE $66,$61,$73,$74,$65,$6e,$73,$0d  ; "fastens\r"
97de: a5                        .BYTE $a5                              ; {Center}
97df: 69 74 73 65 6c 66 20 61   .BYTE $69,$74,$73,$65,$6c,$66,$20,$61  ; "itself a"
97e7: 72 6f 75 6e 64 20 79 6f   .BYTE $72,$6f,$75,$6e,$64,$20,$79,$6f  ; "round yo"
97ef: 75 72 20 6e 65 63 6b 2e   .BYTE $75,$72,$20,$6e,$65,$63,$6b,$2e  ; "ur neck."
97f7: 0d                        .BYTE $0d                              ; "\r"
97f8: ff                        .BYTE $ff                              ; {End of string}

97f9: a6 00 01  StrIronPalmSlv  .BYTE $a6,$00,$01                      ; {Col 0 Row 1}
97fc: a5                        .BYTE $a5                              ; {Center}
97fd: 44 69 72 65 63 74 69 6f   .BYTE $44,$69,$72,$65,$63,$74,$69,$6f  ; "Directio"
9805: 6e 73 20 6f 6e 20 61 20   .BYTE $6e,$73,$20,$6f,$6e,$20,$61,$20  ; "ns on a "
980d: 73 6d 61 6c 6c 20 76 69   .BYTE $73,$6d,$61,$6c,$6c,$20,$76,$69  ; "small vi"
9815: 61 6c 20 68 65 72 65 20   .BYTE $61,$6c,$20,$68,$65,$72,$65,$20  ; "al here "
981d: 72 65 61 64 3a 0d 0d      .BYTE $72,$65,$61,$64,$3a,$0d,$0d      ; "read:\r\r"
9824: a5                        .BYTE $a5                              ; {Center}
9825: 31 2e 20 50 6f 75 72 20   .BYTE $31,$2e,$20,$50,$6f,$75,$72,$20  ; "1. Pour "
982d: 6f 76 65 72 20 68 61 6e   .BYTE $6f,$76,$65,$72,$20,$68,$61,$6e  ; "over han"
9835: 64 73 2e 20 0d 32 2e 20   .BYTE $64,$73,$2e,$20,$0d,$32,$2e,$20  ; "ds. \r2. "
983d: 52 75 62 20 68 61 6e 64   .BYTE $52,$75,$62,$20,$68,$61,$6e,$64  ; "Rub hand"
9845: 73 20 66 69 72 6d 6c 79   .BYTE $73,$20,$66,$69,$72,$6d,$6c,$79  ; "s firmly"
984d: 2e 0d                     .BYTE $2e,$0d                          ; ".\r"
984f: ff                        .BYTE $ff                              ; {End of string}

9850: a6 00 02  StrDeathCard    .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
9853: a5                        .BYTE $a5                              ; {Center}
9854: 53 65 61 6c 65 64 20 69   .BYTE $53,$65,$61,$6c,$65,$64,$20,$69  ; "Sealed i"
985c: 6e 20 61 6e 20 65 6e 76   .BYTE $6e,$20,$61,$6e,$20,$65,$6e,$76  ; "n an env"
9864: 65 6c 6f 70 65 20 69 73   .BYTE $65,$6c,$6f,$70,$65,$20,$69,$73  ; "elope is"
986c: 20 61 20 74 72 75 6d 70   .BYTE $20,$61,$20,$74,$72,$75,$6d,$70  ; " a trump"
9874: 20 63 61 72 64 2e 0d      .BYTE $20,$63,$61,$72,$64,$2e,$0d      ; " card.\r"
987b: ff                        .BYTE $ff                              ; {End of string}

987c: a6 00 02  StrSwrdOfAdept  .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
987f: a5                        .BYTE $a5                              ; {Center}
9880: 41 20 73 77 6f 72 64 20   .BYTE $41,$20,$73,$77,$6f,$72,$64,$20  ; "A sword "
9888: 70 72 6f 74 72 75 64 65   .BYTE $70,$72,$6f,$74,$72,$75,$64,$65  ; "protrude"
9890: 73 20 66 72 6f 6d 20 61   .BYTE $73,$20,$66,$72,$6f,$6d,$20,$61  ; "s from a"
9898: 20 73 6c 61 62 0d         .BYTE $20,$73,$6c,$61,$62,$0d          ; " slab\r"
989e: a5                        .BYTE $a5                              ; {Center}
989f: 6f 66 20 62 6c 61 63 6b   .BYTE $6f,$66,$20,$62,$6c,$61,$63,$6b  ; "of black"
98a7: 20 6d 61 72 62 6c 65 2e   .BYTE $20,$6d,$61,$72,$62,$6c,$65,$2e  ; " marble."
98af: 0d                        .BYTE $0d                              ; "\r"
98b0: ff                        .BYTE $ff                              ; {End of string}

98b1: a6 00 01  StrRazorIce     .BYTE $a6,$00,$01                      ; {Col 0 Row 1}
98b4: a5                        .BYTE $a5                              ; {Center}
98b5: 41 20 6b 61 74 61 6e 61   .BYTE $41,$20,$6b,$61,$74,$61,$6e,$61  ; "A katana"
98bd: 20 69 6e 20 61 20 72 69   .BYTE $20,$69,$6e,$20,$61,$20,$72,$69  ; " in a ri"
98c5: 62 62 65 64 20 62 6c 61   .BYTE $62,$62,$65,$64,$20,$62,$6c,$61  ; "bbed bla"
98cd: 63 6b 20 6c 61 63 71 75   .BYTE $63,$6b,$20,$6c,$61,$63,$71,$75  ; "ck lacqu"
98d5: 65 72 65 64 0d            .BYTE $65,$72,$65,$64,$0d              ; "ered\r"
98da: a5                        .BYTE $a5                              ; {Center}
98db: 73 63 61 62 62 61 72 64   .BYTE $73,$63,$61,$62,$62,$61,$72,$64  ; "scabbard"
98e3: 20 72 65 73 74 73 20 61   .BYTE $20,$72,$65,$73,$74,$73,$20,$61  ; " rests a"
98eb: 67 61 69 6e 73 74 20 61   .BYTE $67,$61,$69,$6e,$73,$74,$20,$61  ; "gainst a"
98f3: 20 77 61 6c 6c 2e 0d 0d   .BYTE $20,$77,$61,$6c,$6c,$2e,$0d,$0d  ; " wall.\r\r"
98fb: a5                        .BYTE $a5                              ; {Center}
98fc: 41 20 70 61 74 74 65 72   .BYTE $41,$20,$70,$61,$74,$74,$65,$72  ; "A patter"
9904: 6e 20 6f 66 20 73 6e 6f   .BYTE $6e,$20,$6f,$66,$20,$73,$6e,$6f  ; "n of sno"
990c: 77 66 6c 61 6b 65 73 20   .BYTE $77,$66,$6c,$61,$6b,$65,$73,$20  ; "wflakes "
9914: 68 61 73 20 62 65 65 6e   .BYTE $68,$61,$73,$20,$62,$65,$65,$6e  ; "has been"
991c: 0d                        .BYTE $0d                              ; "\r"
991d: a5                        .BYTE $a5                              ; {Center}
991e: 68 6f 6e 65 64 20 61 6c   .BYTE $68,$6f,$6e,$65,$64,$20,$61,$6c  ; "honed al"
9926: 6f 6e 67 20 69 74 73 20   .BYTE $6f,$6e,$67,$20,$69,$74,$73,$20  ; "ong its "
992e: 73 69 6e 67 6c 65 20 65   .BYTE $73,$69,$6e,$67,$6c,$65,$20,$65  ; "single e"
9936: 64 67 65 2e 0d            .BYTE $64,$67,$65,$2e,$0d              ; "dge.\r"
993b: ff                        .BYTE $ff                              ; {End of string}

993c: a6 00 02  StrWhetstone    .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
993f: a5                        .BYTE $a5                              ; {Center}
9940: 54 68 65 72 65 20 69 73   .BYTE $54,$68,$65,$72,$65,$20,$69,$73  ; "There is"
9948: 20 61 20 73 6d 61 6c 6c   .BYTE $20,$61,$20,$73,$6d,$61,$6c,$6c  ; " a small"
9950: 20 72 65 63 74 61 6e 67   .BYTE $20,$72,$65,$63,$74,$61,$6e,$67  ; " rectang"
9958: 75 6c 61 72 0d            .BYTE $75,$6c,$61,$72,$0d              ; "ular\r"
995d: a5                        .BYTE $a5                              ; {Center}
995e: 73 68 61 72 70 65 6e 69   .BYTE $73,$68,$61,$72,$70,$65,$6e,$69  ; "sharpeni"
9966: 6e 67 20 73 74 6f 6e 65   .BYTE $6e,$67,$20,$73,$74,$6f,$6e,$65  ; "ng stone"
996e: 20 68 65 72 65 2e 0d      .BYTE $20,$68,$65,$72,$65,$2e,$0d      ; " here.\r"
9975: ff                        .BYTE $ff                              ; {End of string}

9976: a6 00 00  StrSaurnBrandy  .BYTE $a6,$00,$00                      ; {Col 0 Row 0}
9979: a5                        .BYTE $a5                              ; {Center}
997a: 53 69 67 6e 73 20 6f 66   .BYTE $53,$69,$67,$6e,$73,$20,$6f,$66  ; "Signs of"
9982: 20 61 20 67 72 65 61 74   .BYTE $20,$61,$20,$67,$72,$65,$61,$74  ; " a great"
998a: 20 62 61 74 74 6c 65 20   .BYTE $20,$62,$61,$74,$74,$6c,$65,$20  ; " battle "
9992: 62 65 74 77 65 65 6e 20   .BYTE $62,$65,$74,$77,$65,$65,$6e,$20  ; "between "
999a: 61 0d                     .BYTE $61,$0d                          ; "a\r"
999c: a5                        .BYTE $a5                              ; {Center}
999d: 73 69 6e 67 6c 65 20 77   .BYTE $73,$69,$6e,$67,$6c,$65,$20,$77  ; "single w"
99a5: 61 72 72 69 6f 72 20 61   .BYTE $61,$72,$72,$69,$6f,$72,$20,$61  ; "arrior a"
99ad: 6e 64 20 61 20 64 6f 7a   .BYTE $6e,$64,$20,$61,$20,$64,$6f,$7a  ; "nd a doz"
99b5: 65 6e 20 6f 72 20 6d 6f   .BYTE $65,$6e,$20,$6f,$72,$20,$6d,$6f  ; "en or mo"
99bd: 72 65 0d                  .BYTE $72,$65,$0d                      ; "re\r"
99c0: a5                        .BYTE $a5                              ; {Center}
99c1: 61 64 76 65 72 73 61 72   .BYTE $61,$64,$76,$65,$72,$73,$61,$72  ; "adversar"
99c9: 69 65 73 20 6c 69 74 74   .BYTE $69,$65,$73,$20,$6c,$69,$74,$74  ; "ies litt"
99d1: 65 72 20 74 68 69 73 20   .BYTE $65,$72,$20,$74,$68,$69,$73,$20  ; "er this "
99d9: 72 6f 6f 6d 2e 0d         .BYTE $72,$6f,$6f,$6d,$2e,$0d          ; "room.\r"
99df: a5                        .BYTE $a5                              ; {Center}
99e0: 43 6c 75 74 63 68 65 64   .BYTE $43,$6c,$75,$74,$63,$68,$65,$64  ; "Clutched"
99e8: 20 74 69 67 68 74 6c 79   .BYTE $20,$74,$69,$67,$68,$74,$6c,$79  ; " tightly"
99f0: 20 74 6f 20 74 68 65 20   .BYTE $20,$74,$6f,$20,$74,$68,$65,$20  ; " to the "
99f8: 77 61 72 72 69 6f 72 27   .BYTE $77,$61,$72,$72,$69,$6f,$72,$27  ; "warrior'"
9a00: 73 0d                     .BYTE $73,$0d                          ; "s\r"
9a02: a5                        .BYTE $a5                              ; {Center}
9a03: 72 65 6d 61 69 6e 73 20   .BYTE $72,$65,$6d,$61,$69,$6e,$73,$20  ; "remains "
9a0b: 69 73 20 61 20 62 6f 74   .BYTE $69,$73,$20,$61,$20,$62,$6f,$74  ; "is a bot"
9a13: 74 6c 65 20 66 69 6c 6c   .BYTE $74,$6c,$65,$20,$66,$69,$6c,$6c  ; "tle fill"
9a1b: 65 64 20 77 69 74 68 0d   .BYTE $65,$64,$20,$77,$69,$74,$68,$0d  ; "ed with\r"
9a23: a5                        .BYTE $a5                              ; {Center}
9a24: 67 72 65 65 6e 20 6c 69   .BYTE $67,$72,$65,$65,$6e,$20,$6c,$69  ; "green li"
9a2c: 71 75 69 64 2e 0d         .BYTE $71,$75,$69,$64,$2e,$0d          ; "quid.\r"
9a32: ff                        .BYTE $ff                              ; {End of string}

9a33: a6 00 01  StrBluPrlDaggr  .BYTE $a6,$00,$01                      ; {Col 0 Row 1}
9a36: a5                        .BYTE $a5                              ; {Center}
9a37: 49 6e 73 63 72 69 62 65   .BYTE $49,$6e,$73,$63,$72,$69,$62,$65  ; "Inscribe"
9a3f: 64 20 6f 6e 20 74 68 65   .BYTE $64,$20,$6f,$6e,$20,$74,$68,$65  ; "d on the"
9a47: 20 62 6c 61 64 65 20 6f   .BYTE $20,$62,$6c,$61,$64,$65,$20,$6f  ; " blade o"
9a4f: 66 20 61 20 64 61 67 67   .BYTE $66,$20,$61,$20,$64,$61,$67,$67  ; "f a dagg"
9a57: 65 72 0d                  .BYTE $65,$72,$0d                      ; "er\r"
9a5a: a5                        .BYTE $a5                              ; {Center}
9a5b: 61 72 65 20 74 68 65 20   .BYTE $61,$72,$65,$20,$74,$68,$65,$20  ; "are the "
9a63: 77 6f 72 64 73 3a 0d 0d   .BYTE $77,$6f,$72,$64,$73,$3a,$0d,$0d  ; "words:\r\r"
9a6b: a5                        .BYTE $a5                              ; {Center}
9a6c: 22 46 65 61 72 20 6e 6f   .BYTE $22,$46,$65,$61,$72,$20,$6e,$6f  ; ""Fear no"
9a74: 74 20 54 68 65 20 52 65   .BYTE $74,$20,$54,$68,$65,$20,$52,$65  ; "t The Re"
9a7c: 61 70 65 72 22 0d         .BYTE $61,$70,$65,$72,$22,$0d          ; "aper"\r"
9a82: ff                        .BYTE $ff                              ; {End of string}

9a83: a6 00 01  StrSixPack      .BYTE $a6,$00,$01                      ; {Col 0 Row 1}
9a86: a5                        .BYTE $a5                              ; {Center}
9a87: 54 68 65 20 64 65 63 61   .BYTE $54,$68,$65,$20,$64,$65,$63,$61  ; "The deca"
9a8f: 79 69 6e 67 20 72 65 6d   .BYTE $79,$69,$6e,$67,$20,$72,$65,$6d  ; "ying rem"
9a97: 61 69 6e 73 20 6f 66 20   .BYTE $61,$69,$6e,$73,$20,$6f,$66,$20  ; "ains of "
9a9f: 61 6e 20 61 64 76 65 6e   .BYTE $61,$6e,$20,$61,$64,$76,$65,$6e  ; "an adven"
9aa7: 74 75 72 65 72 0d         .BYTE $74,$75,$72,$65,$72,$0d          ; "turer\r"
9aad: a5                        .BYTE $a5                              ; {Center}
9aae: 73 70 6f 72 74 69 6e 67   .BYTE $73,$70,$6f,$72,$74,$69,$6e,$67  ; "sporting"
9ab6: 20 61 20 62 75 73 68 20   .BYTE $20,$61,$20,$62,$75,$73,$68,$20  ; " a bush "
9abe: 68 61 74 20 61 6e 64 20   .BYTE $68,$61,$74,$20,$61,$6e,$64,$20  ; "hat and "
9ac6: 61 20 76 65 72 79 20 6e   .BYTE $61,$20,$76,$65,$72,$79,$20,$6e  ; "a very n"
9ace: 61 73 74 79 0d            .BYTE $61,$73,$74,$79,$0d              ; "asty\r"
9ad3: a5                        .BYTE $a5                              ; {Center}
9ad4: 6b 6e 69 66 65 20 61 72   .BYTE $6b,$6e,$69,$66,$65,$20,$61,$72  ; "knife ar"
9adc: 65 20 68 65 72 65 2e 20   .BYTE $65,$20,$68,$65,$72,$65,$2e,$20  ; "e here. "
9ae4: 49 6e 73 63 72 69 62 65   .BYTE $49,$6e,$73,$63,$72,$69,$62,$65  ; "Inscribe"
9aec: 64 20 6f 6e 20 74 68 65   .BYTE $64,$20,$6f,$6e,$20,$74,$68,$65  ; "d on the"
9af4: 20 62 72 6f 6b 65 6e 0d   .BYTE $20,$62,$72,$6f,$6b,$65,$6e,$0d  ; " broken\r"
9afc: a5                        .BYTE $a5                              ; {Center}
9afd: 62 6c 61 64 65 20 69 73   .BYTE $62,$6c,$61,$64,$65,$20,$69,$73  ; "blade is"
9b05: 20 74 68 65 20 77 6f 72   .BYTE $20,$74,$68,$65,$20,$77,$6f,$72  ; " the wor"
9b0d: 64 20 22 47 27 64 61 79   .BYTE $64,$20,$22,$47,$27,$64,$61,$79  ; "d "G'day"
9b15: 22 2e 20 20 4c 79 69 6e   .BYTE $22,$2e,$20,$20,$4c,$79,$69,$6e  ; "".  Lyin"
9b1d: 67 20 6e 65 78 74 0d      .BYTE $67,$20,$6e,$65,$78,$74,$0d      ; "g next\r"
9b24: a5                        .BYTE $a5                              ; {Center}
9b25: 74 6f 20 68 69 6d 20 61   .BYTE $74,$6f,$20,$68,$69,$6d,$20,$61  ; "to him a"
9b2d: 72 65 20 73 69 78 20 74   .BYTE $72,$65,$20,$73,$69,$78,$20,$74  ; "re six t"
9b35: 61 6c 6c 20 6d 65 74 61   .BYTE $61,$6c,$6c,$20,$6d,$65,$74,$61  ; "all meta"
9b3d: 6c 20 63 79 6c 69 6e 64   .BYTE $6c,$20,$63,$79,$6c,$69,$6e,$64  ; "l cylind"
9b45: 65 72 73 2e 0d            .BYTE $65,$72,$73,$2e,$0d              ; "ers.\r"
9b4a: ff                        .BYTE $ff                              ; {End of string}

9b4b: a6 00 02  StrMelvinsHelm  .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
9b4e: a5                        .BYTE $a5                              ; {Center}
9b4f: 54 68 65 72 65 20 69 73   .BYTE $54,$68,$65,$72,$65,$20,$69,$73  ; "There is"
9b57: 20 67 6f 6c 64 65 6e 20   .BYTE $20,$67,$6f,$6c,$64,$65,$6e,$20  ; " golden "
9b5f: 68 65 6c 6d 20 77 69 74   .BYTE $68,$65,$6c,$6d,$20,$77,$69,$74  ; "helm wit"
9b67: 68 0d                     .BYTE $68,$0d                          ; "h\r"
9b69: a5                        .BYTE $a5                              ; {Center}
9b6a: 74 68 69 72 74 65 65 6e   .BYTE $74,$68,$69,$72,$74,$65,$65,$6e  ; "thirteen"
9b72: 20 6a 65 77 65 6c 73 20   .BYTE $20,$6a,$65,$77,$65,$6c,$73,$20  ; " jewels "
9b7a: 68 65 72 65 2e 0d         .BYTE $68,$65,$72,$65,$2e,$0d          ; "here.\r"
9b80: ff                        .BYTE $ff                              ; {End of string}

9b81: a6 00 02  StrCrossbow     .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
9b84: a5                        .BYTE $a5                              ; {Center}
9b85: 41 20 63 72 6f 73 73 62   .BYTE $41,$20,$63,$72,$6f,$73,$73,$62  ; "A crossb"
9b8d: 6f 77 20 6f 66 20 69 6e   .BYTE $6f,$77,$20,$6f,$66,$20,$69,$6e  ; "ow of in"
9b95: 63 72 65 64 69 62 6c 79   .BYTE $63,$72,$65,$64,$69,$62,$6c,$79  ; "credibly"
9b9d: 20 66 69 6e 65 0d         .BYTE $20,$66,$69,$6e,$65,$0d          ; " fine\r"
9ba3: a5                        .BYTE $a5                              ; {Center}
9ba4: 6d 65 63 68 61 6e 69 63   .BYTE $6d,$65,$63,$68,$61,$6e,$69,$63  ; "mechanic"
9bac: 61 6c 20 77 6f 72 6b 6d   .BYTE $61,$6c,$20,$77,$6f,$72,$6b,$6d  ; "al workm"
9bb4: 61 6e 73 68 69 70 20 6c   .BYTE $61,$6e,$73,$68,$69,$70,$20,$6c  ; "anship l"
9bbc: 69 65 73 20 68 65 72 65   .BYTE $69,$65,$73,$20,$68,$65,$72,$65  ; "ies here"
9bc4: 2e 0d                     .BYTE $2e,$0d                          ; ".\r"
9bc6: ff                        .BYTE $ff                              ; {End of string}

9bc7: a6 00 02  StrAmethystRod  .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
9bca: a5                        .BYTE $a5                              ; {Center}
9bcb: 41 20 62 6c 75 65 2d 76   .BYTE $41,$20,$62,$6c,$75,$65,$2d,$76  ; "A blue-v"
9bd3: 69 6f 6c 65 74 20 71 75   .BYTE $69,$6f,$6c,$65,$74,$20,$71,$75  ; "iolet qu"
9bdb: 61 72 74 7a 20 72 6f 64   .BYTE $61,$72,$74,$7a,$20,$72,$6f,$64  ; "artz rod"
9be3: 20 6c 69 65 73 0d         .BYTE $20,$6c,$69,$65,$73,$0d          ; " lies\r"
9be9: a5                        .BYTE $a5                              ; {Center}
9bea: 6f 6e 20 61 20 70 75 72   .BYTE $6f,$6e,$20,$61,$20,$70,$75,$72  ; "on a pur"
9bf2: 70 6c 65 20 64 61 69 73   .BYTE $70,$6c,$65,$20,$64,$61,$69,$73  ; "ple dais"
9bfa: 2e 0d                     .BYTE $2e,$0d                          ; ".\r"
9bfc: ff                        .BYTE $ff                              ; {End of string}

9bfd: a3 5a 9c  StrMapStone     .BYTE $a3,$5a,$9c                      ; {Call $9c5a [setGenderZts]}
9c00: a6 00 00                  .BYTE $a6,$00,$00                      ; {Col 0 Row 0}
9c03: a5                        .BYTE $a5                              ; {Center}
9c04: 41 20 6e 6f 74 65 20 72   .BYTE $41,$20,$6e,$6f,$74,$65,$20,$72  ; "A note r"
9c0c: 65 61 64 73 3a 0d         .BYTE $65,$61,$64,$73,$3a,$0d          ; "eads:\r"
9c12: b3 21 63 19               .BYTE $b3,$21,$63,$19                  ; {Print zts @ $6321 [ChrName] wid 25}
9c16: 2c 0d 0d 20 20 20 43 6f   .BYTE $2c,$0d,$0d,$20,$20,$20,$43,$6f  ; ",\r\r   Co"
9c1e: 6e 67 72 61 74 75 6c 61   .BYTE $6e,$67,$72,$61,$74,$75,$6c,$61  ; "ngratula"
9c26: 74 69 6f 6e 73 20 6d 79   .BYTE $74,$69,$6f,$6e,$73,$20,$6d,$79  ; "tions my"
9c2e: 20 67 6f 6f 64 20         .BYTE $20,$67,$6f,$6f,$64,$20          ; " good "
9c34: b4 5f 95 05               .BYTE $b4,$5f,$95,$05                  ; {Print zts @ addr in $955f [GenderZts_L] wid 5}
9c38: 20 6f 6e 0d 67 65 74 74   .BYTE $20,$6f,$6e,$0d,$67,$65,$74,$74  ; " on\rgett"
9c40: 69 6e 67 20 74 68 69 73   .BYTE $69,$6e,$67,$20,$74,$68,$69,$73  ; "ing this"
9c48: 20 66 61 72 2e 0d 0d      .BYTE $20,$66,$61,$72,$2e,$0d,$0d      ; " far.\r\r"
9c4f: a7                        .BYTE $a7                              ; {Right Align}
9c50: 41 20 66 72 69 65 6e 64   .BYTE $41,$20,$66,$72,$69,$65,$6e,$64  ; "A friend"
9c58: 0d                        .BYTE $0d                              ; "\r"
9c59: ff                        .BYTE $ff                              ; {End of string}

                ; Assigns GenderZts_L/H to ZtsMan if the player character is male and ZtsWoman if female.
                ;
                ; Output
                ;   GenderZts_L/H  - Set to ZtsMan if CHR_STATE[59] >= 0 and ZtsFemale otherwise.
                ;
9c5a: a9 74     setGenderZts    LDA #$74             ; Set
9c5c: 8d 5f 95                  STA GenderZts_L      ;     GenderZts_L/H
9c5f: a9 9c                     LDA #$9c             ;     to
9c61: 8d 60 95                  STA GenderZts_H      ;     $9c74 [ZtsMan]
9c64: 2c 3b 63                  BIT ChrGender        ; If (ChrGender < 0)
9c67: 10 0a                     BPL loc_9c73         ; Then
9c69: a9 78                     LDA #$78             ;    Set
9c6b: 8d 5f 95                  STA GenderZts_L      ;        GenderZts_L/H
9c6e: a9 9c                     LDA #$9c             ;        to
9c70: 8d 60 95                  STA GenderZts_H      ;        $9c78 [ZtsWoman]
                                                     ; End If
9c73: 60        loc_9c73        RTS                  ; Return to caller

9c74: 6d 61 6e  ZtsMan          .BYTE $6d,$61,$6e    ; man
9c77: 00                        .BYTE $00            ; .

9c78: 77 6f 6d  ZtsWoman        .BYTE $77,$6f,$6d    ; wom
9c7b: 61 6e 00                  .BYTE $61,$6e,$00    ; an.

9c7e: a6 00 02  StrQuarrels     .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
9c81: a5                        .BYTE $a5                              ; {Center}
9c82: 54 68 65 72 65 20 61 72   .BYTE $54,$68,$65,$72,$65,$20,$61,$72  ; "There ar"
9c8a: 65 20 31 30 20 71 75 61   .BYTE $65,$20,$31,$30,$20,$71,$75,$61  ; "e 10 qua"
9c92: 72 72 65 6c 73 20 69 6e   .BYTE $72,$72,$65,$6c,$73,$20,$69,$6e  ; "rrels in"
9c9a: 0d                        .BYTE $0d                              ; "\r"
9c9b: a5                        .BYTE $a5                              ; {Center}
9c9c: 61 20 6d 65 74 61 6c 6c   .BYTE $61,$20,$6d,$65,$74,$61,$6c,$6c  ; "a metall"
9ca4: 69 63 20 63 6c 69 70 20   .BYTE $69,$63,$20,$63,$6c,$69,$70,$20  ; "ic clip "
9cac: 68 65 72 65 2e 0d         .BYTE $68,$65,$72,$65,$2e,$0d          ; "here.\r"
9cb2: ff                        .BYTE $ff                              ; {End of string}

9cb3: a6 00 02  StrStaffOfAmbr  .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
9cb6: a5                        .BYTE $a5                              ; {Center}
9cb7: 54 68 65 72 65 20 69 73   .BYTE $54,$68,$65,$72,$65,$20,$69,$73  ; "There is"
9cbf: 20 61 20 6c 6f 6e 67 20   .BYTE $20,$61,$20,$6c,$6f,$6e,$67,$20  ; " a long "
9cc7: 65 6c 65 63 74 72 75 6d   .BYTE $65,$6c,$65,$63,$74,$72,$75,$6d  ; "electrum"
9ccf: 20 72 6f 64 20 68 65 72   .BYTE $20,$72,$6f,$64,$20,$68,$65,$72  ; " rod her"
9cd7: 65 2e 0d                  .BYTE $65,$2e,$0d                      ; "e.\r"
9cda: ff                        .BYTE $ff                              ; {End of string}

9cdb: a6 00 00  StrRobinsHood   .BYTE $a6,$00,$00                      ; {Col 0 Row 0}
9cde: a5                        .BYTE $a5                              ; {Center}
9cdf: 54 68 65 72 65 20 69 73   .BYTE $54,$68,$65,$72,$65,$20,$69,$73  ; "There is"
9ce7: 20 61 20 64 61 72 6b 20   .BYTE $20,$61,$20,$64,$61,$72,$6b,$20  ; " a dark "
9cef: 63 6f 77 6c 20 68 65 72   .BYTE $63,$6f,$77,$6c,$20,$68,$65,$72  ; "cowl her"
9cf7: 65 2e 0d                  .BYTE $65,$2e,$0d                      ; "e.\r"
9cfa: ff                        .BYTE $ff                              ; {End of string}

9cfb: a6 00 00  StrGoldenApple  .BYTE $a6,$00,$00                      ; {Col 0 Row 0}
9cfe: a5                        .BYTE $a5                              ; {Center}
9cff: 41 20 67 6f 6c 64 65 6e   .BYTE $41,$20,$67,$6f,$6c,$64,$65,$6e  ; "A golden"
9d07: 20 61 70 70 6c 65 20 72   .BYTE $20,$61,$70,$70,$6c,$65,$20,$72  ; " apple r"
9d0f: 65 73 74 73 20 6f 6e 20   .BYTE $65,$73,$74,$73,$20,$6f,$6e,$20  ; "ests on "
9d17: 61 20 67 6f 6c 64 65 6e   .BYTE $61,$20,$67,$6f,$6c,$64,$65,$6e  ; "a golden"
9d1f: 0d                        .BYTE $0d                              ; "\r"
9d20: a5                        .BYTE $a5                              ; {Center}
9d21: 70 69 6c 6c 6f 77 2e 20   .BYTE $70,$69,$6c,$6c,$6f,$77,$2e,$20  ; "pillow. "
9d29: 20 49 6e 73 63 72 69 62   .BYTE $20,$49,$6e,$73,$63,$72,$69,$62  ; " Inscrib"
9d31: 65 64 20 6f 6e 20 74 68   .BYTE $65,$64,$20,$6f,$6e,$20,$74,$68  ; "ed on th"
9d39: 65 20 61 70 70 6c 65 0d   .BYTE $65,$20,$61,$70,$70,$6c,$65,$0d  ; "e apple\r"
9d41: a5                        .BYTE $a5                              ; {Center}
9d42: 61 72 65 20 74 68 65 20   .BYTE $61,$72,$65,$20,$74,$68,$65,$20  ; "are the "
9d4a: 77 6f 72 64 73 3a 0d 0d   .BYTE $77,$6f,$72,$64,$73,$3a,$0d,$0d  ; "words:\r\r"
9d52: a5                        .BYTE $a5                              ; {Center}
9d53: 22 46 6f 72 20 74 68 65   .BYTE $22,$46,$6f,$72,$20,$74,$68,$65  ; ""For the"
9d5b: 20 70 72 65 74 74 79 20   .BYTE $20,$70,$72,$65,$74,$74,$79,$20  ; " pretty "
9d63: 6f 6e 65 2e 22 0d         .BYTE $6f,$6e,$65,$2e,$22,$0d          ; "one."\r"
9d69: ff                        .BYTE $ff                              ; {End of string}

9d6a: a6 00 02  StrGaussRifle   .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
9d6d: a5                        .BYTE $a5                              ; {Center}
9d6e: 54 68 65 72 65 20 69 73   .BYTE $54,$68,$65,$72,$65,$20,$69,$73  ; "There is"
9d76: 20 65 76 69 64 65 6e 63   .BYTE $20,$65,$76,$69,$64,$65,$6e,$63  ; " evidenc"
9d7e: 65 20 6f 66 20 73 6d 61   .BYTE $65,$20,$6f,$66,$20,$73,$6d,$61  ; "e of sma"
9d86: 6c 6c 0d                  .BYTE $6c,$6c,$0d                      ; "ll\r"
9d89: a5                        .BYTE $a5                              ; {Center}
9d8a: 77 65 61 70 6f 6e 73 20   .BYTE $77,$65,$61,$70,$6f,$6e,$73,$20  ; "weapons "
9d92: 66 69 72 65 20 68 65 72   .BYTE $66,$69,$72,$65,$20,$68,$65,$72  ; "fire her"
9d9a: 65 2e 0d                  .BYTE $65,$2e,$0d                      ; "e.\r"
9d9d: ff                        .BYTE $ff                              ; {End of string}

9d9e: a6 00 02  StrSolarSuit    .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
9da1: a5                        .BYTE $a5                              ; {Center}
9da2: 54 68 65 72 65 20 61 72   .BYTE $54,$68,$65,$72,$65,$20,$61,$72  ; "There ar"
9daa: 65 20 73 6f 6d 65 20 64   .BYTE $65,$20,$73,$6f,$6d,$65,$20,$64  ; "e some d"
9db2: 69 73 67 75 73 74 69 6e   .BYTE $69,$73,$67,$75,$73,$74,$69,$6e  ; "isgustin"
9dba: 67 20 73 74 61 69 6e 73   .BYTE $67,$20,$73,$74,$61,$69,$6e,$73  ; "g stains"
9dc2: 0d                        .BYTE $0d                              ; "\r"
9dc3: a5                        .BYTE $a5                              ; {Center}
9dc4: 6f 6e 20 74 68 65 20 66   .BYTE $6f,$6e,$20,$74,$68,$65,$20,$66  ; "on the f"
9dcc: 6c 6f 6f 72 20 61 6e 64   .BYTE $6c,$6f,$6f,$72,$20,$61,$6e,$64  ; "loor and"
9dd4: 20 61 6e 20 6f 64 64 20   .BYTE $20,$61,$6e,$20,$6f,$64,$64,$20  ; " an odd "
9ddc: 6c 6f 6f 6b 69 6e 67 0d   .BYTE $6c,$6f,$6f,$6b,$69,$6e,$67,$0d  ; "looking\r"
9de4: a5                        .BYTE $a5                              ; {Center}
9de5: 73 69 6c 76 65 72 79 20   .BYTE $73,$69,$6c,$76,$65,$72,$79,$20  ; "silvery "
9ded: 71 75 69 6c 74 65 64 20   .BYTE $71,$75,$69,$6c,$74,$65,$64,$20  ; "quilted "
9df5: 76 65 73 74 2e 0d         .BYTE $76,$65,$73,$74,$2e,$0d          ; "vest.\r"
9dfb: ff                        .BYTE $ff                              ; {End of string}

9dfc: a6 00 02  StrBeamWeapon   .BYTE $a6,$00,$02                      ; {Col 0 Row 2}
9dff: a5                        .BYTE $a5                              ; {Center}
9e00: 41 6e 20 65 6e 65 72 67   .BYTE $41,$6e,$20,$65,$6e,$65,$72,$67  ; "An energ"
9e08: 79 20 70 69 73 74 6f 6c   .BYTE $79,$20,$70,$69,$73,$74,$6f,$6c  ; "y pistol"
9e10: 20 69 73 20 68 61 6e 67   .BYTE $20,$69,$73,$20,$68,$61,$6e,$67  ; " is hang"
9e18: 69 6e 67 0d               .BYTE $69,$6e,$67,$0d                  ; "ing\r"
9e1c: a5                        .BYTE $a5                              ; {Center}
9e1d: 6f 6e 20 61 20 77 61 6c   .BYTE $6f,$6e,$20,$61,$20,$77,$61,$6c  ; "on a wal"
9e25: 6c 20 72 61 63 6b 2e 0d   .BYTE $6c,$20,$72,$61,$63,$6b,$2e,$0d  ; "l rack.\r"
9e2d: ff                        .BYTE $ff                              ; {End of string}

9e2e: 63 8f 05  TreasureTmpl_L  .BYTE $63,$8f,$05                      ; 32 bytes: LSB of treasure template string
9e31: 4b 70 ad eb 16 63 69 db   .BYTE $4b,$70,$ad,$eb,$16,$63,$69,$db  ;
9e39: 63 f9 50 7c b1 3c 76 33   .BYTE $63,$f9,$50,$7c,$b1,$3c,$76,$33  ;
9e41: 83 4b 81 c7 fd 7e 7e b3   .BYTE $83,$4b,$81,$c7,$fd,$7e,$7e,$b3  ;
9e49: ba fb 6a 9e fc            .BYTE $ba,$fb,$6a,$9e,$fc              ;

9e4e: 95 95 96  TreasureTmpl_H  .BYTE $95,$95,$96                      ; 32 bytes: MSB of treasure template string
9e51: 96 96 96 96 97 95 97 9c   .BYTE $96,$96,$96,$96,$97,$95,$97,$9c  ;    0: $9563 [StrTrumpCard] (The Star)
9e59: 95 97 98 98 98 99 99 9a   .BYTE $95,$97,$98,$98,$98,$99,$99,$9a  ;    1: $958f [StrWingedSndls]
9e61: 9a 9b 9b 9b 9b 9c 9c 9c   .BYTE $9a,$9b,$9b,$9b,$9b,$9c,$9c,$9c  ;    2: $9605 [StrRstratnPotn]
9e69: 97 9c 9d 9d 9d            .BYTE $97,$9c,$9d,$9d,$9d              ;    3: $964b [StrMorgnsTiara]
                                                                       ;    4: $9670 [StrHelmOfLight]
                                                                       ;    5: $96ad [StrTruslvrCoat]
                                                                       ;    6: $96eb [StrClkLevitatn]
                                                                       ;    7: $9716 [StrCrystlBrplt]
                                                                       ;    8: $9563 [StrTrumpCard] (Page of Cups)
                                                                       ;    9: $9769 [StrJunaisSword]
                                                                       ;   10: $9cdb [StrRobinsHood]
                                                                       ;   11: $9563 [StrTrumpCard] (Death)
                                                                       ;   12: $97f9 [StrIronPalmSlv]
                                                                       ;   13: $9850 [StrDeathCard]
                                                                       ;   14: $987c [StrSwrdOfAdept]
                                                                       ;   15: $98b1 [StrRazorIce]
                                                                       ;   16: $993c [StrWhetstone]
                                                                       ;   17: $9976 [StrSaurnBrandy]
                                                                       ;   18: $9a33 [StrBluPrlDaggr]
                                                                       ;   19: $9a83 [StrSixPack]
                                                                       ;   20: $9b4b [StrMelvinsHelm]
                                                                       ;   21: $9b81 [StrCrossbow]
                                                                       ;   22: $9bc7 [StrAmethystRod]
                                                                       ;   23: $9bfd [StrMapStone]
                                                                       ;   24: $9c7e [StrQuarrels] (Flame)
                                                                       ;   25: $9c7e [StrQuarrels] (Thunder)
                                                                       ;   26: $9cb3 [StrStaffOfAmbr]
                                                                       ;   27: $97ba [StrLoadstone]
                                                                       ;   28: $9cfb [StrGoldenApple]
                                                                       ;   29: $9d6a [StrGaussRifle]
                                                                       ;   30: $9d9e [StrSolarSuit]
                                                                       ;   31: $9dfc [StrBeamWeapon]

      ;
      ; The following appears to be a copy of $9454 through $95e5 (402 bytes).
      ;
9e6e: 48 81 94  unk_9e6e        .BYTE $48,$81,$94                      ; H..
9e71: 81 e0 81 2c 82 76 82 c1   .BYTE $81,$e0,$81,$2c,$82,$76,$82,$c1  ; ...,.v..
9e79: 82 0d 83 4b 83 98 83 e3   .BYTE $82,$0d,$83,$4b,$83,$98,$83,$e3  ; ...K....
9e81: 83 10 84 7c 84 c7 84 15   .BYTE $83,$10,$84,$7c,$84,$c7,$84,$15  ; ...|....
9e89: 85 31 85 4c 85 79 85 a2   .BYTE $85,$31,$85,$4c,$85,$79,$85,$a2  ; .1.L.y..
9e91: 85 db 85 a0 cc ec 0a 2a   .BYTE $85,$db,$85,$a0,$cc,$ec,$0a,$2a  ; .......*
9e99: 4a 93 93 93 94 94 94 e6   .BYTE $4a,$93,$93,$93,$94,$94,$94,$e6  ; J.......
9ea1: 6f 4c a7 7d fc d0 0d c5   .BYTE $6f,$4c,$a7,$7d,$fc,$d0,$0d,$c5  ; oL.}....
9ea9: 36 9e 84 8f 84 b7 e4 08   .BYTE $36,$9e,$84,$8f,$84,$b7,$e4,$08  ; 6.......
9eb1: 1d 54 80 b5 0c d8 0e 23   .BYTE $1d,$54,$80,$b5,$0c,$d8,$0e,$23  ; .T.....#
9eb9: 4b 75 6e d4 0a 35 75 78   .BYTE $4b,$75,$6e,$d4,$0a,$35,$75,$78  ; Kun..5ux
9ec1: 8f 85 8f 89 8a 8f 90 7a   .BYTE $8f,$85,$8f,$89,$8a,$8f,$90,$7a  ; .......z
9ec9: 90 92 79 90 79 90 90 91   .BYTE $90,$92,$79,$90,$79,$90,$90,$91  ; ..y.y...
9ed1: 91 91 91 91 88 91 92 92   .BYTE $91,$91,$91,$91,$88,$91,$92,$92  ; ........
9ed9: 92 92 90 92 93 93 93 3c   .BYTE $92,$92,$90,$92,$93,$93,$93,$3c  ; .......<
9ee1: 50 6a 83 98 ba 04 4b 8e   .BYTE $50,$6a,$83,$98,$ba,$04,$4b,$8e  ; Pj....K.
9ee9: 8e 8e 8e 8e 8e 8f 8f 10   .BYTE $8e,$8e,$8e,$8e,$8e,$8f,$8f,$10  ; ........
9ef1: 20 30 40 58 70 7a 84 8e   .BYTE $20,$30,$40,$58,$70,$7a,$84,$8e  ;  0@Xpz..
9ef9: 92 96 9a 9e a6 b6 ba ca   .BYTE $92,$96,$9a,$9e,$a6,$b6,$ba,$ca  ; ........
9f01: e0 f0 f4 f8 ff 08 18 28   .BYTE $e0,$f0,$f4,$f8,$ff,$08,$18,$28  ; .......(
9f09: 40 50 68 70 78 80 88 98   .BYTE $40,$50,$68,$70,$78,$80,$88,$98  ; @Phpx...
9f11: a8 b4 c0 e0 ff 04 08 20   .BYTE $a8,$b4,$c0,$e0,$ff,$04,$08,$20  ; .......
9f19: 24 28 38 40 60 70 80 90   .BYTE $24,$28,$38,$40,$60,$70,$80,$90  ; $(8@`p..
9f21: a8 c0 d8 ff 04 08 0c 10   .BYTE $a8,$c0,$d8,$ff,$04,$08,$0c,$10  ; ........
9f29: 30 50 70 90 b0 b4 b8 bc   .BYTE $30,$50,$70,$90,$b0,$b4,$b8,$bc  ; 0Pp.....
9f31: c0 e0 f0 ff 10 20 50 54   .BYTE $c0,$e0,$f0,$ff,$10,$20,$50,$54  ; ..... PT
9f39: 5c 60 68 78 88 9c ac c4   .BYTE $5c,$60,$68,$78,$88,$9c,$ac,$c4  ; \`hx....
9f41: dc f4 fc ff 10 20 30 40   .BYTE $dc,$f4,$fc,$ff,$10,$20,$30,$40  ; ..... 0@
9f49: 50 52 54 56 58 5a 5c 64   .BYTE $50,$52,$54,$56,$58,$5a,$5c,$64  ; PRTVXZ\d
9f51: 66 68 88 90 a0 a8 ac b0   .BYTE $66,$68,$88,$90,$a0,$a8,$ac,$b0  ; fh......
9f59: c0 e0 f0 ff d6 ec fc 0b   .BYTE $c0,$e0,$f0,$ff,$d6,$ec,$fc,$0b  ; ........
9f61: 1b 2b 94 94 94 95 95 95   .BYTE $1b,$2b,$94,$94,$94,$95,$95,$95  ; .+......
9f69: 3c 50 6a 83 98 ba 04 4b   .BYTE $3c,$50,$6a,$83,$98,$ba,$04,$4b  ; <Pj....K
9f71: 8e 8e 8e 8e 8e 8e 8f 8f   .BYTE $8e,$8e,$8e,$8e,$8e,$8e,$8f,$8f  ; ........
9f79: 00 00 a8 ff a6 00 02 a5   .BYTE $00,$00,$a8,$ff,$a6,$00,$02,$a5  ; ........
9f81: 53 65 61 6c 65 64 20 69   .BYTE $53,$65,$61,$6c,$65,$64,$20,$69  ; Sealed i
9f89: 6e 20 61 6e 20 65 6e 76   .BYTE $6e,$20,$61,$6e,$20,$65,$6e,$76  ; n an env
9f91: 65 6c 6f 70 65 20 69 73   .BYTE $65,$6c,$6f,$70,$65,$20,$69,$73  ; elope is
9f99: 20 61 20 74 72 75 6d 70   .BYTE $20,$61,$20,$74,$72,$75,$6d,$70  ;  a trump
9fa1: 20 63 61 72 64 2e 0d ff   .BYTE $20,$63,$61,$72,$64,$2e,$0d,$ff  ;  card...
9fa9: a6 00 01 a5 41 20 70 6f   .BYTE $a6,$00,$01,$a5,$41,$20,$70,$6f  ; ....A po
9fb1: 77 65 72 66 75 6c 20 62   .BYTE $77,$65,$72,$66,$75,$6c,$20,$62  ; werful b
9fb9: 75 74 20 66 65 6d 69 6e   .BYTE $75,$74,$20,$66,$65,$6d,$69,$6e  ; ut femin
9fc1: 69 6e 65 20 76 6f 69 63   .BYTE $69,$6e,$65,$20,$76,$6f,$69,$63  ; ine voic
9fc9: 65 20 73 61 79 73 3a 0d   .BYTE $65,$20,$73,$61,$79,$73,$3a,$0d  ; e says:.
9fd1: 0d a5 22 46 6f 72 20 74   .BYTE $0d,$a5,$22,$46,$6f,$72,$20,$74  ; .."For t
9fd9: 68 79 20 76 69 63 74 6f   .BYTE $68,$79,$20,$76,$69,$63,$74,$6f  ; hy victo
9fe1: 72 79 20 49 20 67 69 76   .BYTE $72,$79,$20,$49,$20,$67,$69,$76  ; ry I giv
9fe9: 65 20 74 68 65 65 20 74   .BYTE $65,$20,$74,$68,$65,$65,$20,$74  ; e thee t
9ff1: 68 65 73 65 0d a5 73 61   .BYTE $68,$65,$73,$65,$0d,$a5,$73,$61  ; hese..sa
9ff9: 6e 64 61 6c 73 20 74      .BYTE $6e,$64,$61,$6c,$73,$20,$74      ; ndals t
