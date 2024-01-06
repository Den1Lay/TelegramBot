const getMbtiDataObj = () => {
  return {
    stage: 0,
    step: 0,
    Ni: 0,
    Ne: 0,
    Si: 0,
    Se: 0,
    Ti: 0,
    Te: 0,
    Fi: 0,
    Fe: 0,
  
    NiP: 0,
    NeP: 0,
    SiP: 0,
    SeP: 0,
    TiP: 0,
    TeP: 0,
    FiP: 0,
    FeP: 0,
    
    NiM: 0,
    NeM: 0,
    SiM: 0,
    SeM: 0,
    TiM: 0,
    TeM: 0,
    FiM: 0,
    FeM: 0,
  
    I: 0,
    E: 0
  }
}

const getTestData = () => {
  return [
    [
      {type: 'd',  text1: 'У меня в основном есть план, в приоритете анализирование и продумывание.', text2: 'У меня в основном нет плана, в приоритете импровизация на месте.',  slot1: 'Ni', slot2: 'Ne'},
      {type: 'd',  text1: 'Я знаю много о малом.', text2: 'Я знаю немного о многом.',  slot1: 'Ne', slot2: 'Ni' },
      {type: 'd',  text1: 'Я обычно не отхожу от темы и рассматриваю её с разных сторон.', text2: 'В разговоре перескоки между темами - обычное дело.',  slot1: 'Ni', slot2: 'Ne' },
      {type: 'd',  text1: 'Мои идеи - углубленное рассмотрение одной идеи.', text2: 'Мои идеи разнообразны.',  slot1: 'Ni', slot2: 'Ne' },
      {type: 'd',  text1: 'При восприятии информации обращаю внимание на символы и образы, что всплывают в моём сознании.', text2: 'При восприятии информации обращаю внимание на возможности и потенциальные варианты реализации идей (даже если не планирую их реализовывать).',  slot1: 'Ni', slot2: 'Ne' },
      {type: 'd',  text1: 'Мои озарения бывают не слишком часто (раз в пол года) и они достаточно абстрактные и глубокие.', text2: 'Мои озарения происходят достаточно часто и их достаточно просто использовать, реализовывать.',  slot1: 'Ni', slot2: 'Ne' },
      {type: 'd',  text1: 'Большое кол-во возможностей является для меня стрессом. Не терплю неопределенность.', text2: 'Мне важно всегда иметь выбор, быстро перестраивать жизнь и видеть большое кол-во возможностей.',  slot1: 'Ni', slot2: 'Ne' },

      {type: 'd',  text1: 'Я учусь на своих ошибках.', text2: 'Я забываю о своих неудачах.',  slot1: 'Si', slot2: 'Se' },
      {type: 'd',  text1: 'Я больше наблюдаю, чем реагирую.', text2: 'Я больше реагирую, чем наблюдаю.',  slot1: 'Si', slot2: 'Se' },
      {type: 'd',  text1: 'В основном я делаю всё одинаково, могу документировать свои действия.', text2: 'Концентрируюсь на процессе, а не на последовательности.',  slot1: 'Si', slot2: 'Se' },
      {type: 'd',  text1: 'Я действительно думаю перед каким-то действием, а также использую имеющийся опыт.', text2: 'Я импульсивен.',  slot1: 'Si', slot2: 'Se' },
      {type: 'd',  text1: 'План моего будущего построен на опыте прошлого.', text2: 'У меня нет плана будущего, я живу в настоящем.',  slot1: 'Si', slot2: 'Se' },
      {type: 'd',  text1: 'Я буду повторять те действия, которые уже принесли мне радость.', text2: 'Я ищу новые методы получения удовольствия. (постоянный поиск новой музыки)',  slot1: 'Si', slot2: 'Se' },
      {type: 'd',  text1: 'Мои действия направлены на поддержание имеющейся системы. (работы, семьи, дома)', text2: 'Мои действия, это про жизнь в настоящем моменте (эмоции, риск, движение вперед).',  slot1: 'Si', slot2: 'Se' },

      {type: 'd',  text1: 'Мои ценности - это мои ценности.', text2: 'Я полностью разделяю ценности, принятые в обществе.',  slot1: 'Fi', slot2: 'Fe' },
      {type: 'd',  text1: 'Я - уникальный человек.', text2: 'Я хочу быть частью общества.',  slot1: 'Fi', slot2: 'Fe' },
      {type: 'd',  text1: 'Я концентрируюсь на своих эмоциях и переживаниях.', text2: 'Я хорошо замечаю изменения в эмоциях людей вокруг меня.',  slot1: 'Fi', slot2: 'Fe' },
      {type: 'd',  text1: 'Я составляю мнение, ставя в приоритет себя, а не группу.', text2: 'Я обязательно найду время для того, чтобы встретиться с друзьями/коллегами.',  slot1: 'Fi', slot2: 'Fe' },
      {type: 'd',  text1: 'Я стараюсь не подстраиваться под людей.', text2: 'Отдельная маска на каждого человека или группу - это я.',  slot1: 'Fi', slot2: 'Fe' },
      {type: 'd',  text1: 'Я осознаю себя больше, чем других.', text2: 'Я понимаю кого угодно лучше, чем себя.',  slot1: 'Fi', slot2: 'Fe' },
      {type: 'd',  text1: 'Мои ценности и принципы невозможно изменить.', text2: 'Мои ценности понятны и доступны большинству.',  slot1: 'Fi', slot2: 'Fe' },

      {type: 'd',  text1: 'Я даю советы.', text2: 'Я даю указания.',  slot1: 'Ti', slot2: 'Te' },
      {type: 'd',  text1: 'Важно выделить время и продумать все до мелочей.', text2: 'Важно добиться результата.',  slot1: 'Ti', slot2: 'Te' },
      {type: 'd',  text1: 'Моя логика используется для создания систем и объяснения процессов.', text2: 'Моя логика ориентирована на то, как действовать.',  slot1: 'Ti', slot2: 'Te' },
      {type: 'd',  text1: 'Исследую, потому что хочется узнать, как это работает.', text2: 'Исследую с целью применения.',  slot1: 'Ti', slot2: 'Te' },
      {type: 'd',  text1: 'Очень хорошо распознаю логические последовательности.', text2: 'Могу быть действительно жестоким.',  slot1: 'Ti', slot2: 'Te' },
      {type: 'd',  text1: 'Умею давать вещам названия.', text2: 'Есть склонность к перфекционизму.',  slot1: 'Ti', slot2: 'Te' },
      {type: 'd',  text1: 'Вижу в фактах их самостоятельную ценность.', text2: 'Использую факты для подтверждения собственных теорий или размышлений.',  slot1: 'Ti', slot2: 'Te' },
      // 28

      {type: 's', text: 'Мне бывает сложно объяснить свои ценности.', slot:'FiP'},
      {type: 's', text: 'У мен глаз намётан на эстетичные вещи и Я наслаждаетесь “прелестями жизни”.', slot:'SeP'},
      {type: 's', text: 'Исследую более глубокий смысл.', slot:'NiP'},
      {type: 's', text: 'Мне бывает сложно объяснить свой ход мыслей.', slot:'TiP'},
      {type: 's', text: 'Могу работать, даже если несчастлив.', slot:'TeP'},
      {type: 's', text: 'Приятно работать одному.', slot:'TiP'},
      {type: 's', text: 'Живу здесь и сейчас.', slot:'SeP'},
      {type: 's', text: 'Оцениваю людей по тому, кто на сколько полезен.', slot:'TeP'},
      {type: 's', text: 'Предпочитаю оставаться в обществе.', slot:'FeP'},
      {type: 's', text: 'Собственные желания имеют наибольший приоритет.', slot:'FiP'},
      {type: 's', text: 'Поддерживаю связь со многими людьми.', slot:'FeP'},
      {type: 's', text: 'Придерживаюсь стабильной повседневности.', slot:'SiP'},
      {type: 's', text: 'Часто рассматриваю последствия и непредвиденные обстоятельства.', slot:'NiP'},
      {type: 's', text: 'Легкая, как перышко душа.', slot:'NeP'},
      {type: 's', text: 'Действительно наслаждаюсь атмосферой праздников.', slot:'SiP'},
      {type: 's', text: 'Испытываю подъем сил от новых возможностей, знаний.', slot:'NeP'},

      
      {type: 's', text: 'Не люблю авторитет.', slot:'SiM'},
      {type: 's', text: 'Противоречия не интересуют.', slot:'TiM'},
      {type: 's', text: 'Не понимаю трудоголиков.', slot:'TeM'},
      {type: 's', text: 'Не могу быстро менять точку зрения.', slot:'NeM'},
      {type: 's', text: 'Не люблю держать слишком много информации в голове.', slot:'TiM'}, //что это??
      {type: 's', text: 'Ухожи в глубокие размышления и планирование своего будущего.', slot:'SeM'}, 
      {type: 's', text: 'Осторожен к эмоциональной интенсивности.', slot:'FiM'}, 
      {type: 's', text: 'Не часто думаю о призвании или цели.', slot:'NiM'}, 
      {type: 's', text: 'Избегаю рискованного поведения.', slot:'SeM'}, 
      {type: 's', text: 'Ставлю логику в приоритет чувствам других.', slot:'FeM'}, 
      {type: 's', text: 'Не привлекают абстрактные системы и представления чего – либо.', slot:'NiM'}, 
      {type: 's', text: 'Нет новых идей.', slot:'NeM'}, 
      {type: 's', text: 'При принятии быстрых решений, скорее ориентируюсь на какие - то личные соображения, чем на чистую логику.', slot:'TiM'}, 
      {type: 's', text: 'Испытываю стресс при социальном взаимодействии.', slot:'FeM'}, 
      {type: 's', text: 'Не люблю принимать быстрые решения.', slot:'TeM'},
      {type: 's', text: 'Стараюсь абстрагироваться от личных чувств при принятии решения.', slot:'FiM'},
      {type: 's', text: 'Предпочитаю решать проблему самостоятельно, чем попросить помощи.', slot:'FeM'},
      {type: 's', text: 'Меня тяжело назвать семейным человеком.', slot:'SiM'},
      {type: 's', text: 'Мои принципы и ценности могут поменяться, если я окажусь в чуждом для меня обществе.', slot:'FiM'},
      {type: 's', text: 'У меня дома не всегда убрано.', slot:'SiM'},
      {type: 's', text: 'Я не тактильный человек.', slot:'SeM'},

    ],
    {
      "sfj": [
        {type: 's', text: 'Могу комфортно обсуждать свои эмоции и чувства со многими людьми.', slot:'E__'},
        {type: 's', text: 'Могу заводить большое количество знакомств на фоне морального голода.', slot:'E__'},
        {type: 's', text: 'Никогда не забуду полить цветок, вытереть пыль.', slot:'I__'}, // сомнительно
        {type: 's', text: 'Могу потерять чувственную связь с внешним миром.', slot:'I__'},
        {type: 's', text: 'Особенно тяжело принимать холодные логические решения.', slot:'E__'},
        {type: 's', text: 'Тяжело изменить себя.', slot:'I__'},
      ],
      "stj": [
        {type: 's', text: 'Тяжело изменить себя.', slot:'I__'},
        {type: 's', text: 'Мне понравилось бы управлять группой людей.', slot:'E__'},
        {type: 's', text: 'Начинаю думать о собственных чувствах, только когда все плохо.', slot:'E__'},
        {type: 's', text: 'Бывают иррациональные привязанности.', slot:'I__'},
        {type: 's', text: 'Обращаю слишком много внимания на детали.', slot:'I__'},
        {type: 's', text: 'Все время нахожусь в движении.', slot:'E__'},
      ],
      "nfj": [
        {type: 's', text: 'Могу стать невероятно холодным человеком.', slot:'I__'},
        {type: 's', text: 'Имеются трудности с принятием логических решений.', slot:'E__'},
        {type: 's', text: 'Тяжело найти друга.', slot:'I__'},
        {type: 's', text: 'Тяжело выражать собственные чувства другим.', slot:'I__'},
        {type: 's', text: 'Действия могут принять импульсивный характер.', slot:'E__'},
        {type: 's', text: 'Тяжело переношу одиночество.', slot:'E__'},
      ],
      "ntj": [
        {type: 's', text: 'Могу уйти от продуктивного состояния в собственные эмоции и ощущения.', slot:'I__'},
        {type: 's', text: 'Бывает тяжело полностью находится в настоящем моменте и наслаждаться им.', slot:'I__'},
        {type: 's', text: 'Тяжело остановиться в своей работе.', slot:'E__'},
        {type: 's', text: 'Очень самокритичен.', slot:'I__'},
        {type: 's', text: 'Начинаю думать о своих эмоциях и чувствах, только когда все плохо.', slot:'E__'},
        {type: 's', text: 'Не боюсь рисковать.', slot:'E__'},
      ],
      "sfp": [
        {type: 's', text: 'Меня тяжело остановить.', slot:'E__'},
        {type: 's', text: 'Тяжело переношу одиночество.', slot:'E__'},
        {type: 's', text: 'Могу испытывать трудности с тем, чтобы начать действовать.', slot:'I__'},
        {type: 's', text: 'Я прямолинеен.', slot:'E__'},
        {type: 's', text: 'Много времени провожу в своих размышлениях.', slot:'I__'},
        {type: 's', text: 'Не просто стать моим другом.', slot:'I__'},
      ], 
      "stp": [
        {type: 's', text: 'Моя логическая сторона может отключиться, чтобы дать мне насладиться моментом и повеселиться.', slot:'E__'},
        {type: 's', text: 'Завести друга бывает очень сложно.', slot:'I__'},
        {type: 's', text: 'У меня бывают приступы перфекционизма.', slot:'I__'},
        {type: 's', text: 'Постоянно замечаете логические ошибки.', slot:'I__'},
        {type: 's', text: 'Комфортно быть в центре внимания.', slot:'E__'},
        {type: 's', text: 'Люблю наводить суету.', slot:'E__'},
      ],
      "ntp": [
        {type: 's', text: 'Мне нравится работать в команде.', slot:'E__'},
        {type: 's', text: 'Харизма, юмор и позитивная энергия, это про меня.', slot:'E__'},
        {type: 's', text: 'Профессионально подвергаю сомнению все, даже собственные убеждения.', slot:'E__'},
        {type: 's', text: 'Я эмоционально стабильный человек.', slot:'I__'},
        {type: 's', text: 'В своей работе Я предпочетаю сконцентрироваться на чем-то одном.', slot:'I__'},
        {type: 's', text: 'Завести друга бывает очень сложно.', slot:'I__'},
      ],
      "nfp": [
        {type: 's', text: 'Меня можно назвать ветренной личностью.', slot:'E__'},
        {type: 's', text: 'Мне не просто завести себе нового друга.', slot:'I__'},
        {type: 's', text: 'Люблю наводить суету.', slot:'E__'},
        {type: 's', text: 'Не люблю доводить работу до конца.', slot:'E__'},
        {type: 's', text: 'Много думаю о прошлом.', slot:'I__'},
        {type: 's', text: 'Могу зациклиться на своих мыслях.', slot:'I__'},
      ]
    }
  ]
}

const updateMbtiData = ({cacheDataObj, fun, flag, plus=true}) => {
  const {Ni,Ne,Fi,Fe,Si,Se,Ti,Te,I,E,step} = cacheDataObj;
  const {NiP,NeP,FiP,FeP,SiP,SeP,TiP,TeP} = cacheDataObj;
  const {NiM,NeM,FiM,FeM,SiM,SeM,TiM,TeM} = cacheDataObj;
  cacheDataObj.step = step+1;
  if(flag === 'd') {
    switch(fun) {
      case 'Ni':
        cacheDataObj.Ni=Ni+2;
        cacheDataObj.Ne=Ne-1;
        break
      case 'Ne':
        cacheDataObj.Ne=Ne+2;
        cacheDataObj.Ni=Ni-1;
        break
      case 'Fi':
        cacheDataObj.Fi=Fi+2;
        cacheDataObj.Fe=Fe-1;
        break
      case 'Fe':
        cacheDataObj.Fe=Fe+2;
        cacheDataObj.Fi=Fi-1;
        break
      case 'Si':
        cacheDataObj.Si=Si+2;
        cacheDataObj.Se=Se-1;
        break
      case 'Se':
        cacheDataObj.Se=Se+2;
        cacheDataObj.Si=Si-1;
        break
      case 'Ti':
        cacheDataObj.Ti=Ti+2;
        cacheDataObj.Te=Te-1;
        break
      case 'Te':
        cacheDataObj.Te=Te+2;
        cacheDataObj.Ti=Ti-1;
        break
    }
  }
  if(flag === 's') {
    switch(fun) {
      case 'FiP':
        cacheDataObj.FiP=plus ? FiP+2 : FiP-1;
        break
      case 'FeP':
        cacheDataObj.FeP=plus ? FeP+2 : FeP-1;
        break
      case 'NiP':
        cacheDataObj.NiP=plus ? NiP+2 : NiP-1;
        break
      case 'NeP':
        cacheDataObj.NeP=plus ? NeP+2 : NeP-1;
        break
      case 'SiP':
        cacheDataObj.SiP=plus ? SiP+2 : SiP-1;
        break
      case 'SeP':
        cacheDataObj.SeP=plus ? SeP+2 : SeP-1;
        break
      case 'TiP':
        cacheDataObj.TiP=plus ? TiP+2 : TiP-1;
        break
      case 'TeP':
        cacheDataObj.TeP=plus ? TeP+2 : TeP-1;
        break


      case 'FiM':
        cacheDataObj.FiM=plus ? FiM+2 : FiM-1;
        break
      case 'FeM':
        cacheDataObj.FeM=plus ? FeM+2 : FeM-1;
        break
      case 'NiM':
        cacheDataObj.NiM=plus ? NiM+2 : NiM-1;
        break
      case 'NeM':
        cacheDataObj.NeM=plus ? NeM+2 : NeM-1;
        break
      case 'SiM':
        cacheDataObj.SiM=plus ? SiM+2 : SiM-1;
        break
      case 'SeM':
        cacheDataObj.SeM=plus ? SeM+2 : SeM-1;
        break
      case 'TiM':
        cacheDataObj.TiM=plus ? TiM+2 : TiM-1;
        break
      case 'TeM':
        cacheDataObj.TeM=plus ? TeM+2 : TeM-1;
        break


      case 'I__':
        if(plus) {
          cacheDataObj.I = I+1;
        } else {
          cacheDataObj.E = E+1;
        };
        break
      case 'E__':
        if(plus) {
          cacheDataObj.E = E+1;
        } else {
          cacheDataObj.I = I+1;
        }
        break

    }
  }

  console.log({cacheDataObj_inside: cacheDataObj});
}

const calcMidMbti = (cacheDataObj) => {
  const {Ni,Ne,Fi,Fe,Si,Se,Ti,Te,step} = cacheDataObj;
  const {NiP,NeP,FiP,FeP,SiP,SeP,TiP,TeP} = cacheDataObj;
  const {NiM,NeM,FiM,FeM,SiM,SeM,TiM,TeM} = cacheDataObj;
  const mbti = [
		[7*Ni + 5*Fe + 3*Ti + 1*Se + 6*NiP + 4*FeP - 6*NiM - 4*FeM, 'INFJ'],
		[7*Ni + 5*Te + 3*Fi + 1*Se + 6*NiP + 4*TeP - 6*NiM - 4*TeM, 'INTJ'],
		[7*Fi + 5*Ne + 3*Si + 1*Te + 6*FiP + 4*NeP - 6*FiM - 4*NeM, 'INFP'],
		[7*Ti + 5*Ne + 3*Si + 1*Fe + 6*TiP + 4*NeP - 6*TiM - 4*NeM, 'INTP'],
		[7*Si + 5*Fe + 3*Ti + 1*Ne + 6*SiP + 4*FeP - 6*SiM - 4*FeM, 'ISFJ'],
		[7*Si + 5*Te + 3*Fi + 1*Ne + 6*SiP + 4*TeP - 6*SiM - 4*TeM, 'ISTJ'],
		[7*Fi + 5*Se + 3*Ni + 1*Te + 6*FiP + 4*SeP - 6*FiM - 4*SeM, 'ISFP'],
		[7*Ti + 5*Se + 3*Ni + 1*Fe + 6*TiP + 4*SeP - 6*TiM - 4*SeM, 'ISTP'],
		[7*Fe + 5*Ni + 3*Se + 1*Ti + 6*FeP + 4*NiP - 6*FeM - 4*NiM, 'ENFJ'],
		[7*Te + 5*Ni + 3*Se + 1*Fi + 6*TeP + 4*NiP - 6*TeM - 4*NiM, 'ENTJ'],
		[7*Ne + 5*Fi + 3*Te + 1*Si + 6*NeP + 4*FiP - 6*NeM - 4*FiM, 'ENFP'],
		[7*Ne + 5*Ti + 3*Fe + 1*Si + 6*NeP + 4*TiP - 6*NeM - 4*TiM, 'ENTP'],
		[7*Fe + 5*Si + 3*Ne + 1*Ti + 6*FeP + 4*SiP - 6*FeM - 4*SiM, 'ESFJ'],
		[7*Te + 5*Si + 3*Ne + 1*Fi + 6*TeP + 4*SiP - 6*TeM - 4*SiM, 'ESTJ'],
		[7*Se + 5*Fi + 3*Te + 1*Ni + 6*SeP + 4*FiP - 6*SeM - 4*FiM, 'ESFP'],
		[7*Se + 5*Ti + 3*Fe + 1*Ni + 6*SeP + 4*TiP - 6*SeM - 4*TiM, 'ESTP'],
	]
	const sortedMbti = mbti.sort(function(a,b) { if (a[0] - b[0] != 0) return a[0] - b[0]; return a[1] < b[1];});
  console.log({mbti,sortedMbti: sortedMbti.reverse()});
  let resType;
  if(sortedMbti[0][0] === sortedMbti[1][0]) {
    resType = sortedMbti[Number(Math.random() > 0.5)][1];
  } else {
    resType = sortedMbti[0][1];
  }

  return {full: resType.toLowerCase(), payload: resType.toLowerCase().slice(1)};

  // записать формулу... 
}


module.exports = { 
  getMbtiDataObj, 
  getTestData,
  updateMbtiData,
  calcMidMbti
};