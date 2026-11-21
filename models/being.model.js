import { obj, identity, str, optional, num, numbers, skillNames, ids, extras } from './shared.js'

const currentAttributes = ['pv', 'dp', 'shield', 'defense', 'sanity', 'ammo']

export const being = obj({
  caractheristics: obj({ ...identity, 'player-name': str, wishes: optional }),
  atributes: obj({
    ...numbers('level dp sanity pv shield ammo'),
    defense: num.default(0),
    pary: num.optional(),
    dodge: num.optional(),
    ...Object.fromEntries(
      currentAttributes.map((name) => [`current-${name}`, num.optional()]),
    ),
  }).transform((attributes) => {
    for (const name of currentAttributes) {
      attributes[`current-${name}`] ??= attributes[name]
    }
    return attributes
  }),
  habilities: obj({
    naturals: obj(numbers('inteligence wisdom existance')),
    main: obj(numbers('intelect strengh agility charisma willing')),
    lasts: obj({ ...numbers(skillNames), investigation: num.optional() }),
    'atained-objects': ids.default([]),
    money: ids.default([]),
    extras,
  }),
})

