import re

with open("script.js", "r") as f:
    content = f.read()

content = content.replace(
    'const pill = create("span", className, item);',
    'const pill = create("span", className, item, `profile.focusAreas.${index}`);'
)
content = content.replace(
    'card.append(create("strong", "", marker.value));',
    'card.append(create("strong", "", marker.value, `profile.journeyMarkers.${index}.value`));'
)
content = content.replace(
    'card.append(create("span", "", marker.label));',
    'card.append(create("span", "", marker.label, `profile.journeyMarkers.${index}.label`));'
)
content = content.replace(
    'card.append(create("h2", "", item.title));',
    'card.append(create("h2", "", item.title, `personalMap.${index}.title`));'
)
content = content.replace(
    'card.append(create("p", "card-kicker", chapter.anchor));',
    'card.append(create("p", "card-kicker", chapter.anchor, `lifeChapters.${index}.anchor`));'
)
content = content.replace(
    'top.append(create("p", "card-kicker", item.label));',
    'top.append(create("p", "card-kicker", item.label, `personalMap.${index}.label`));'
)

with open("script.js", "w") as f:
    f.write(content)
print("Updated script.js again")
