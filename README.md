# Ecil Menager

0x01 0x18 0x00 0x00 0x00 0x00 0x00 // le valores da entrada do cappo.


J
0x01 0x19 0x00 0x00 0x00 0x00 0x00 // seta cappo em tipo J
0x01 0x1A 0x2C 0x00 0x00 0x00 0x2C // seta saída sem o ponto decimal
0x01 0x1A 0x18 0x00 0x00 0x00 0x18 // its e SEM compensacao
0x01 0x1A 0x10 0x00 0x00 0x00 0x10 // DESABILITA COMPENSAÇÃO 
0x01 0x1A 0x30 0x00 0x00 0x00 0x30 // DESABILITA COMPENSAÇÃO E SETA SAIDA 
0x01 0x1A 0x38 0x00 0x00 0x00 0x38 // DESABILITA COMPENSAÇÃO E SETA SAIDA E ITS
0x01 0x1A 0x3C 0x00 0x00 0x00 0x3C


0x01 0x1B 0x00 0x0A 0x00 0x00 0x0A  // 10° 
0x01 0x1B 0x01 0x2C 0x00 0x00 0x2D  // 300°
0x01 0x1B 0x02 0xEE 0x10 0x00 0x00  // 750°

K
0x01 0x19 0x01 0x00 0x00 0x00 0x01 // seta cappo em tipo K
0x01 0x1A 0x2C 0x00 0x00 0x00 0x2C // seta saída sem o ponto decimal
0x01 0x1B 0x00 0x0A 0x00 0x00 0x0A // 10° 
0x01 0x1B 0x01 0x2C 0x00 0x00 0x2D // 300°
0x01 0x1B 0x02 0xEE 0x10 0x00 0x00  // 750°


PT100 
0x01 0x19 0x0E 0x00 0x00 0x00 0x0E // seta cappo em tipo PT100
0x01 0x1A 0x2C 0x00 0x00 0x00 0x2C // seta saída sem o ponto decimal
0x01 0x1B 0x00 0x00 0x00 0x00 0xFE
0x01 0x1B 0xFF 0x42 0x00 0x00 0x41 // -190°
0x01 0x1B 0x01 0x2C 0x00 0x00 0x2D // 300°
0x01 0x1B 0x03 0x20 0x00 0x00 0x23 // 800°

0x01 0x1B 0x00 0x0A 0x00 0x00 0x0A // -190°
0x01 0x20 0x00 0x00 0x00 0x00 0x00


Set IN
0x01 