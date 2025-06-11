## Description

Pets can be obtained through the shop.
There are three types of eggs available for purchase: Basic, Intermediate, and Advanced.
Each egg has a different chance of hatching a pet of corresponding rarity—Common, Rare, or Epic.
I plan to take inspiration from the Pokémon system for skills, evolution, property, and battles.
Players will be able to train their pets and challenge each other in duels.
For visual representation, we are currently exploring the use of ASCII art to bring each pet to life in a unique and nostalgic way.
Or maybe, we can ask AI for the art instead of using ASCII art.


Junior egg
<p>
    <img src="https://github.com/side-project-taiwan/sideproj.tw-discord-bot/blob/add-pet-design/design/pet-system/pic/junior_egg.png?raw=true" alt="egg" width="300"/>
</p>

```
[使用者發送指令]
        |
        v
  ┌────────────────────┐
  │ /shop buy xxx      │───▶ 檢查里程是否足夠
  └────────────────────┘       |
        |                      v
     足夠：扣里程 + 獲得xxx  不足：回傳「里程不足」
        |
        v
   顯示購買成功訊息
        |
        v
     放入背包

─────────────────────────────────────

╭───────────────────────────╮
│       /shop buy egg       │
╰────────────┬──────────────╯
             │ 里程足夠？                 
      ┌──────┴──────┐                  
      │ Yes         │ No              
      ▼             ▼                  
  扣里程、獲得蛋   提示里程不足          
      │                                 
      ▼                                 
╭───────────────────────────╮
│         /pet hatch        │
╰────────────┬──────────────╯
             │ 背包有蛋？                 
      ┌──────┴──────┐                  
      │ Yes         │ No              
      ▼             ▼                  
  進入孵化流程   提示先購買蛋            
      │                                 
╭─────┴──────────────────────────────╮
│  玩家選擇孵化方式：                  │
│  隨機孵化       自訂寵物圖           │
╰─────┬──────────────────────────────╯
      │
┌─────┴─────────────┐    ┌────────────────────┐
│ 隨機孵化           │    │ 自訂寵物           │
│ • 抽稀有度         │    │ • 輸入名稱 + 上傳圖 │
│ • 從池中挑形象     │    └──────────┬─────────┘
└─────┬─────────────┘               │
      │                             │
      ▼                             ▼
            🎉 生成/紀錄寵物資訊            
                       │
                       ▼
          顯示「寵物資訊卡」Embed        
          寵物, 品種, 稀有度, 心情, 整潔, 飢餓
          技能,進化?
```



pet info card example
```
🐾 你的寵物資訊：

   __
o-''))_____\\
"--__/ * * * )
c_c__/-c____/

名稱：小黑
等級：5
經驗值：██████░░░░░░ 60%
快樂度：█████░░░░░░░ 50%
飽食度：███████░░░░░ 70%
整潔度：████░░░░░░░░ 40%
```



IDEA of PET: https://github.com/liamrosenfeld/AnimalFarmBot

png -> ascii art https://codepen.io/Mikhail-Bespalov/full/JoPqYrz

pet example

```大便獸
大便獸
                                                                                                                                                      
                                                                                                                                                      
                      l)"                                                                                                                             
                   .~XLbku'                                                                                                                           
                "qpZO0Zphpx'                                                                                                                          
                uqQQzCZphpx'                                                                                                                          
              .+wbbdbbk*od)'                                                                                                                          
            'udqOLLJJJCCQMmdC.                                                                                                                        
            'LYI'':uCUc>`^iUh`                                                                                                                        
          'r0Q:/pXu}mW-vna|Ib0v:.                                                                                                                     
        'zbwwv;dB$*fwk?k@@k-rqwdq'                                                                                                                    
        }kqZ0b)+|)/fOmn{(([}kQZqbu                                                                                                                    
        "YkkdwwpdkkW88&hbddwmpbhp;                                                                                                                    
     .ikkkh**hhk/<".  .">[okka#akkh+.                                                                                                                 
    .jkpwZO0Qa$$$@$$$$$$$$$@*L0ZZwpbL.                                                                                                                
    +hdpmOLCQ&$$@$WJYYUo@$$$$JJL0mqbk/                                                                                                                
    'rkpqmOOm0WhxJQOmqO0CtbWYZZOmwpbQ`                                                                                                                
 '.``")hkdddpddpdpddpdddddddpddpdbhf"^.                                                                                                               
...''''`^,,,::;;IIIIlIIII;;;:::,,^`'''.    
```
```川普獸
TRUMP
                                            ..''''l(1-_-_----_--)()(l`^''.'.                        
                                           .`'',1)/\\[__--__]1[__--_-}1;'`'.                        
                                           .`;}rr?----+?}{1{?__]/1?f?/|[[^^.                        
                                           .,(\?-__)\\fr|}_--)r]__/[\{+[?[`'                        
                                           .i1__](|?______-{|--}f--11-]?_?`'                        
                                           .]?{j//1f/t\(1}{)\/\1[]}}||)?}^''                        
                                           '({j?-_|1{}}}}{{}}}}[}}{}{j]?{"''                        
                                           ._-{{(\)}{))}{[[(11[[{[[}{f_+[`''                        
                                           .[1\{f}1|t//|})ff{/r)}[)ttt]}+...                        
                                           .;xunn})j/nJLcxx{}/xvL0rf)n1-_''.                        
      .'.'''``''..'                         "1f/f})(1/||/\{{}\1\((/x1fz~`...     ...'`''`'^''.'     
      ...'.'I~^'.'.                        .`?(ux{{}{{}}{}[{}1{{{}}{{f\,''..      .''")ur(`''.'     
     .''''Ij{}U:.'.                        .`"uzj1}}}}{{\x|[}|ft}}{}{/:`..'.      '."c)[)v`'.'.     
......''''_(}fd!...                        .'''^!(}}}}}j1t(|tf\}j){}{1'''...     .''_v}}\_'''.'     
..'.'.'.''~|\kr`...                        ..'.`:|}}}{r1{fuunuf)}j1{)l'''        .`'_0}{)]''...     
'``:{t-"^"t)[Q}..'.                         ...'`_\}}{{11|fxnj|1/{{[rl''.      '''''"Car|Xv,`''     
'`i/{}}1(|{{)nu:...                        .'''''`?)(}}}{f/\\/\}}{|j;[!`'     ..'")ff|)1}{{JL,'     
,\r{(x}{{fr}{{Y!.'.               ........'.'''''`^(t/rj{}{}}{}{f/n~"tw]`'`'..''^n}}{{)f1}jYt}`.'...
(X1{}tpLtz*Y{/Z^.'.            .......'.'.''^,<)XqdppJ\{jr){)fn(nU>,!OwdbO}^'.''`1MbqZc1}{}{}ui.''.'
(j(11{{{(zw()k\'...            '`';l<?\U0OZwpqwmwdwwZ{rQpZYvc0Ln-,:,|qwqppqwL[,^,f{{{}[}{}Jxn{ni`.'.
mL)|vuYUQhon*kj"'''         '.'+qkwwwwwwqwqwwwppqwwqfi,,-LXzJ|;,",^lwwwwwwdwwwqwUUbmQCYv)}1r)}{v}`''
r}|{[}}1(Ut\odu]'''         .`]dbqqwwwwwwwwwqdwwwwww[!,1*oLw#*U;",,rqwwwwqmdwqmwwqz}}{}{{)jO/}{}XL:.
oO11ua##*d{)(r-m"'.         'xMbhpwwwwwwqwwh*kpwwwww!ifQ+Qwh>ina}:iZwwwwqwwmbpwwwwp#*aahQ(}{{{{|Op0:
,}LYzmwqUQkv<,)pj''         `~hhopwwwwwwwphpqwwwwwwc:<;:UO**j,^";<vwqwwwwwh#bqwwwwwwC{{}\zJ\}}vU]pb]
`'\kpqbmf>,",fpwO!'      ``,wpqo#dwwwqwqbopphdqwwwq/,,"jLw#*O;"""Iwwwwwkbwwqdpwwwwqwwko*##*oOoQ;/kd-
`|Xbqx<,"",;Upwqqt'     .`[qbbwdoaqwwwwmh#dmqwqqwww}""<JLQ**mI","jpwwwwwwhqqo#kqwwwwbkd()**#*pfipdwi
'"xZl+X1",\oqqwwww`   '.`'f*phpw**pqwwwwp*kwwwwwwqZ+,"uCCLp#w!""lZwwwwwwwwq##dwwwwmq*dhZ^UaXax;0bqpt
^_|(ZCj?|k#pwwwwqw>'.''`|*hdakbw*#apwwwwqoawwwwwwwQl"+QJLLLapi^"{qwwwwqwqq**dwqwwwqh*bobnfpQv+0aqwmq
:t,:U/vo**bwwwwwqpqi'`nobqphbwqq***hwqwwwhoqwwwwwwQ:,uCCLJLkq!""Lqwwqwwwq**pmwwwwwwhqm*pwndurwaowwwq
\qkM##**#*wwwwwwwqo#xUqmwwpqqqqd**#Mhwqmwq*dwwwqqwc,>CCCCLCdOI^?bqwwwwwwa*kwwwwwqwqbwq#ppmOuk#hbwwwm
^c**#*#*#kwwwwwqwmaapo##hdwmwwwb#**##oqwwwabwwwwwqj,jLCCLCChz,,Cqwwwwwwa*hmwwwwwwwbpqq#pmqpo*bhdqwqq
''{a***#*bwwwwwwqqddqoabdpkaqqwk#*#**#hqwmbhwwwwwq|!QCCCCCLo)"~wwwwwwqd#hwwwwqwwwbdwph#*ha*#kd*qwwwh
.`'~k##*#kpdqwwwwwqqwo*o*awqqwwp*#*#*#hqqwqoqwqwqw-xLCLCLCCk+"|pwwqwwp*oqwwwwwwwppwh*b##**#kqoawqwpo
   .>k#&%&&MMMopwwwwqabpaMhwwwwq**#*#*kwwwqabwwwwq+CCCCCCCCm;"Oqwwwwqa*wwwwwwwwdbqo**b##**pwaoqwwwpo
```
```cat
G8貓
         /\     /\
        {  `---'  }
        {  O   O  }
        ~~>  V  <~~
         \  \|/  /
          `-----'____
          /     \    \_
         {       }\  )_\_   _
         |  \_/  |/ /  \_\_/ )
          \__/  /(_/     \__)
            (__/

```
```dragon
稀有龍
                   /           /
                  /' .,,,,  ./       
                 /';'     ,/        
                / /   ,,//,`'`     
               ( ,, '_,  ,,,' ``   
               |    /@  ,,, ;" `   
              /    .   ,''/' `,``  
             /   .     ./, `,, ` ; 
          ,./  .   ,-,',` ,,/''\,' 
         |   /; ./,','`,,'' |   |  
         |     /   ','    /    |   
          \___/'   '     |     |    
               |         |     |    
               |         |     |    
               |         /      \   
               |        |        |  
```
```SB DOG
SB DOG
         __
      o-''|\_____/)
       \_/|_)     )
          \  __  /
          (_/ (_/ 
```
```FROG
FROG
     @..@
    (----)
   ( >__< )
   ^^ ~~ ^^
```
``` FOX
CAT
     ／＞　 フ
    | 　_　_| 
  ／` ミ＿xノ 
 /　　　　 |
(　 ヽ＿ヽ_)__)
＼二 )
```
```孔雀
孔雀
        ,--.
       {    }
       K,   }
      /  `Y`
     /   /
    (_   \   ____
      \   \/---._`-.
       \        `-' \
        `-._____.-'
           |  |
          (===)
         (=====)
        (=======)
       /         \
     /             \
    /___/     \___\
```    

```
horse
                                .. .;>?>]I                                                                                                            
                      .. ..':;. <:xbd\({+^`^.  ..   .  .                                                                                              
                  '`nx'+f_[Yc[CXnX\v\vULj>'+nuvux1{||_'`'                                                                                             
                  .'!MJ,cLqopCdp#kJjbp/qu|UJtLOZUuQJitC?.'' !?'.                                                                                      
                  ..|*U{dp{OpLJwzL<<Ibv,uC_uZ/zUOjQo#*qOLOL+C>_".                                                                                     
                  .':h}l,`"_hhqi . `^.'`}mC_-n[m!ZCmoL[ckboZU\/".']-                                                                                  
                  ':t';~+']!:!)|''   ' .l]XfjxXfkJ]_|tJtUoohmLCLmwt'"'                                                                                
                '^;"'.`l|-(+l<(<+(>'..'' '.'.I;"!i<{10l\/JkduzX{kc--['                                                                                
                ,J'`;cYOhxZ;;X#dfxj]/>)!';.'  '`!"`'"^/1{U(kamwhoZv?^.                                                                                
               '!I'[a<i'\i  'IznwhhOU1fvc+`?     .    ''^[|(?1th`':ii<;.                                                                              
             '.lI ."`.''.    ]pOO/+foM^[fi^~I+!          '1';!+[(x\.                                                                                  
             'j, .;cwm:'   '?OppqO]t/^Uf!:"dc|+fi"!"'^.        l|{_<:.                                                                                
            :1l';|j[1 .~_",;zc< .^(mUh":"!,YtQ<1`.             ,.;i!1(+'                                                                              
          '"I' .[tI'' ;\?_\_[.   ''`(dqxf)nJY\".         '."^;"1|I,'  :t>'                                                                            
          _QJ_,ii_{.;{U[]l'         .'(Zvxc|{_",~'' ";_!^`..   .,>l.   ."+j\                                                                          
          :mxCwuY(uj~"''             `.{wbd-n{l^'. .ri`.        .."?}`:.  .`?j{C01'                                                                   
          '[moqmOu`'                  .iLkakt.    '. .     'I1-1{[//;.      ''''^`!\t?wdn,                                                            
          '''`IuL".                     rh#vi'    ^I<"'''  .'::':,^`'.             '..''`:{)fnmZlI`'.                                                 
               .                 .'';:`''|aOc"`.i:-/z`.      .'' ''.                      '.`.''[1cj?;l~_-+i'  '                                      
                              . `>|_(j"}\ftnrx{Lqz(?^'   ..'.!?{;..                        '!l...'I)(jkwXYJvxC}(>.                                    
                              .,cv`~maod/}'`I})LYz{~,'  ';10qQ};.                          .l[l'  .l~)0cQvt;J//Cjt\_..                                
                              'OOZ]]b#hkkQ((cUtj;?'. . `thOav-`                             .<1"'' . ^)-n]-Jt+zn/0dwhmf''.                            
                            ''!vki|jO*qcpaoZbdoh`''`'[:tpJJ,]_.                              ")|^'..  I\>uqC|\Uu"chbfoMWQl''                          
                            .'ip~^~!   ''[Zpdapkbkn?\*hM*Yj;)?;'                          'I>.}O!,^    '\Xz)zvtvlQXQqaqjh#fxf.   '.                   
                              'L{~j'        .^|xzfz0k*kZpbmt|]!!`.''                      {+{,jq"/}'   .`"jJOb{]j-?uhooJCq*Cpt[(i)-1|~                
                            .'(v.+b/^             ."{/QkqQxLCX\x;/l",.'"^`;i'.  '..   `:<?v))'{OUf{^.    .~{p##Ctvz/(cwmdzJqmh*aZr|~^,''              
                            .,L<:~czQ>'               `'!]jaZpO?Zu1uru/]f)/-<:i+/~,iI?<1LUnc~]0md~->'      UkQd*jJcz{LJjUcq|qoqh0+\v\<.'              
                             'XkfxC+)aY~t]n_               .`I!|p*pUO0ZLQmXxJrYnt\uYZpow0(}{jjUaoc-+<\.   'dXZo*|U0f!qunxzn1v_LzYdu~]c,I|-'           
                              'n-^''u'O``+bIz.                  ''....'`^</XLJJX\}>^.'<#dh#boOzmkbJ-lrf   `[0#MnocC(hjIwLUr~xQur". '''Yn_'z^          
                              '^axjj"omaLOq1I'                                        .+Qdophda#Znf}`nn^'.`?+p{Y/awmObprjr)oQQ)z+~Xx>^''}_'`          
                              .'^cwO>^ ~x\}>i.                                        ..:zn\UoaaLbUf!ll^^`~"vX{'MzbmhxUzwLQQjjLL{p[>:f\~'''           
                                .':|/     .'..                                          . 1{-fUuOoowYC'"<>i>{/<..0C*dvpaJJYb+YrQ/ufnrf^:l             
                                 .''.                                                     .',~{c}ak**{xJzc;<<>|,',r/mpxdv}zx?Y|)<[)q)|]/`.            
                                                                                            .',Ui<XOO*kr}["j;,/I..1fYfZrr|O|I_L\(wu_/><-?l.           
                                                                                               .'L`Iwk*bUf;v~-^ZX'[{.  ?n,`''(n:`!Zm)>..,x;           
                                                                                                  -|luYmmdL>;'..Xb|,.    '.}I. '_>`IfkX' .).          
                                                                                                   .1(j/JuJOcff-.Xxj\^.          ";''ih{'.            
                                                                                                      lt_:(doadq,!kUO"'               ,x..            
                                                                                                       ';Y\Xco)YLr+Q\{'               ^?'             
                                                                                                         "q}<qJ;I0z:rb'               .'.             
                                                                                                         '.hn)u" iX~lcp'                              
                                                                                                           ,Ul?Q`'?vz^,l                              
                                                                                                           `n_;/X`.]O>,/..                            
                                                                                                            ;u0![J''1v._|'.                           
                                                                                                            .iQ{.?Y>-q{.If,'                          
                                                                                                              zah,fa}un\(C_''                         
                                                                                                                "0CZi);Jt>I`<!`                       
                                                                                                                 'lvuk\f{pYi{Q-'                      
                                                                                                                 .   ''"  }/LvI.                   
```
─────────────────────────────────────
```
  ┌────────────────────────┐
  │ /pet feed              │───▶ 餵食寵物（需要飼料）
  └────────────────────────┘

  ┌────────────────────────┐
  │ /pet clean             │───▶ 清理排泄物
  └────────────────────────┘

  ┌────────────────────────┐
  │ /pet play              │───▶ 提升快樂度、親密度
  └────────────────────────┘

  ┌────────────────────────┐
  │ /checkin               │───▶ 打卡獲得里程 + 寵物加成
  └────────────────────────┘
```

