import { CustomDilemmaSet } from '../types';

export const MORAL_DILEMMAS_SETS: CustomDilemmaSet[] = [
    {
        name: 'Leben',
        dilemmas: [
            { id: 'dilemma-1', text: "Würdest du einen unschuldigen Menschen opfern, um fünf andere zu retten?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-2', text: "Würdest du das Haustier einer anderen Person opfern, um dein eigenes zu retten?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-3', text: "Du könntest die Heilung für eine tödliche Krankheit finden, müsstest dafür aber Tierversuche durchführen, die den Tieren Schmerzen bereiten. Tust du es?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-4', text: "Du könntest die Welt von allen Krankheiten befreien, aber dafür würde die menschliche Lebensspanne auf 40 Jahre verkürzt. Tust du es?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-5', text: "Du bist Arzt und hast nur eine Dosis eines lebensrettenden Medikaments. Zwei Patienten brauchen es, aber nur einer kann es bekommen. Wer bekommt es?", optionA: 'Der Jüngere', optionB: 'Der Ältere'},
            { id: 'dilemma-6', text: "Würdest du ein Leben lang auf dein Lieblingsessen verzichten, um eine Million hungernde Kinder zu ernähren?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-7', text: "Du könntest ein Medikament entwickeln, das alle Menschen schön macht, aber es hätte schwere Nebenwirkungen. Tust du es?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-8', text: "Würdest du ein kleines Kind opfern, um die gesamte Menschheit zu retten?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-9', text: "Du hast die Möglichkeit, eine Person, die du liebst, vor dem Tod zu bewahren, aber dafür müsste eine andere, dir unbekannte Person sterben. Tust du es?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-10', text: "Du könntest eine Welt erschaffen, in der es kein Leid gibt, aber dafür gäbe es auch keine Freude. Tust du es?", optionA: 'Ja', optionB: 'Nein'},
        ]
    },
    {
        name: 'Loyalität',
        dilemmas: [
            { id: 'dilemma-11', text: "Würdest du 1 Million Euro annehmen, wenn du dafür nie wieder mit deinem besten Freund sprechen dürftest?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-12', text: "Würdest du die peinlichsten Geheimnisse deines besten Freundes für beruflichen Erfolg verraten?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-13', text: "Würdest du ein Verbrechen gestehen, das du nicht begangen hast, um einen geliebten Menschen vor dem Gefängnis zu bewahren?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-14', text: "Du siehst, wie ein Freund seinen Partner betrügt. Konfrontierst du den Freund oder erzählst du es dem betrogenen Partner?", optionA: 'Freund konfrontieren', optionB: 'Partner informieren'},
            { id: 'dilemma-15', text: "Würdest du einen Freund decken, der eine geringfügige Straftat begangen hat, um ihn vor Konsequenzen zu bewahren?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-16', text: "Würdest du eine Beziehung beenden, wenn du wüsstest, dass dein Partner dich in 5 Jahren betrügen wird, aber bis dahin sehr glücklich mit dir wäre?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-17', text: "Du siehst, wie jemand, den du nicht magst, in Gefahr ist. Rettet du ihn, auch wenn es dich in Gefahr bringt?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-18', text: "Du könntest die Gedanken deines Partners lesen. Würdest du es tun, auch wenn du Dinge erfahren könntest, die dich verletzen?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-19', text: "Würdest du ein Versprechen brechen, wenn es bedeutet, dass du dadurch jemandem helfen kannst, der in Not ist?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-20', text: "Du findest heraus, dass ein Freund von dir ein Geheimnis hat, das seine Ehe zerstören könnte. Erzählst du es seinem Partner?", optionA: 'Ja', optionB: 'Nein'},
        ]
    },
    {
        name: 'Integrität',
        dilemmas: [
            { id: 'dilemma-21', text: "Würdest du einen gefundenen Lottoschein mit dem Millionengewinn für dich behalten, obwohl du den Besitzer ausfindig machen könntest?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-22', text: "Wenn du wüsstest, dass niemand es je herausfindet, würdest du bei einer wichtigen Prüfung schummeln?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-23', text: "Du bist Zeuge eines Ladendiebstahls, bei dem jemand Essen für seine hungernde Familie stiehlt. Meldest du es der Polizei?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-24', text: "Du findest eine Tasche voller Geld auf der Straße. Es gibt keine Hinweise auf den Besitzer. Behältst du das Geld?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-25', text: "Würdest du die Wahrheit sagen, auch wenn es bedeutet, dass du deinen Job verlierst?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-26', text: "Würdest du lügen, um die Gefühle einer Person zu schützen, auch wenn die Wahrheit besser wäre?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-27', text: "Würdest du eine Lüge verbreiten, um einen größeren Skandal zu verhindern, der viele Menschen betreffen würde?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-28', text: "Du bist der einzige Zeuge eines Unfalls, bei dem ein teures Auto beschädigt wurde. Der Fahrer bittet dich, zu lügen, um seine Versicherung zu schonen. Tust du es?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-29', text: "Du findest heraus, dass dein Vorbild in der Öffentlichkeit heimlich etwas Illegales tut, das niemandem schadet. Veröffentlichst du es?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-30', text: "Würdest du die Identität eines Whistleblowers preisgeben, der ein großes Unternehmen entlarvt hat, aber dafür ins Gefängnis müsste?", optionA: 'Ja', optionB: 'Nein'},
        ]
    },
    {
        name: 'Existenz',
        dilemmas: [
            { id: 'dilemma-31', text: "Würdest du in eine Zeitmaschine steigen, die nur in die Zukunft reist, ohne eine Möglichkeit zur Rückkehr?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-32', text: "Würdest du 10 Jahre deines Lebens abgeben, um herauszufinden, ob es ein Leben nach dem Tod gibt?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-33', text: "Würdest du lieber in einer Welt ohne Lügen oder in einer Welt ohne Geheimnisse leben?", optionA: 'Ohne Lügen', optionB: 'Ohne Geheimnisse'},
            { id: 'dilemma-34', text: "Du könntest den Klimawandel stoppen, aber dafür müsste die gesamte Menschheit auf Internet verzichten. Tust du es?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-35', text: "Du hast die Möglichkeit, in die Vergangenheit zu reisen und einen Fehler zu korrigieren, der dir passiert ist, aber es würde die Zukunft unvorhersehbar verändern. Tust du es?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-36', text: "Du könntest die Erinnerungen an eine traumatische Erfahrung löschen, aber dabei auch alle schönen Erinnerungen, die damit verbunden sind. Tust du es?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-37', text: "Würdest du lieber die Fähigkeit haben, die Zukunft vorherzusehen, oder die Fähigkeit, die Vergangenheit zu ändern?", optionA: 'Zukunft vorhersehen', optionB: 'Vergangenheit ändern'},
            { id: 'dilemma-38', text: "Du könntest ewiges Leben haben, aber dafür müsstest du zusehen, wie alle deine Liebsten sterben. Nimmst du es an?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-39', text: "Würdest du lieber in einer Welt leben, in der jeder immer die Wahrheit sagt, oder in einer Welt, in der jeder immer nett ist?", optionA: 'Immer Wahrheit', optionB: 'Immer nett'},
            { id: 'dilemma-40', text: "Du könntest eine Maschine erfinden, die alle Probleme der Welt löst, aber sie würde auch die menschliche Kreativität und den freien Willen eliminieren. Tust du es?", optionA: 'Ja', optionB: 'Nein'},
        ]
    },
    {
        name: 'Persönlich',
        dilemmas: [
            { id: 'dilemma-41', text: "Würdest du die Gedanken anderer Menschen lesen können wollen, auch wenn du die schrecklichsten Wahrheiten über dich erfahren könntest?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-42', text: "Würdest du lieber geliebt, aber nicht respektiert, oder respektiert, aber nicht geliebt werden?", optionA: 'Geliebt, nicht respektiert', optionB: 'Respektiert, nicht geliebt'},
            { id: 'dilemma-43', text: "Würdest du aufhören, Fleisch zu essen, wenn du damit den Klimawandel signifikant verlangsamen könntest?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-44', text: "Würdest du eine Pille nehmen, die dich dauerhaft glücklich macht, aber alle tiefen Emotionen wie Trauer oder Liebe auslöscht?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-45', text: "Würdest du einen Knopf drücken, der dir sofort 10.000 Euro gibt, aber einer zufälligen Person auf der Welt einen schmerzhaften (aber nicht tödlichen) Stromschlag versetzt?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-46', text: "Würdest du einen Job annehmen, der dich unglücklich macht, aber deiner Familie ein luxuriöses Leben ermöglicht?", optionA: 'Ja', optionB: 'Nein'},
            { id: 'dilemma-47', text: "Würdest du lieber nie wieder traurig sein können oder nie wieder glücklich sein können?", optionA: 'Nie wieder traurig', optionB: 'Nie wieder glücklich'},
            { id: 'dilemma-48', text: "Würdest du lieber nie wieder lügen können oder nie wieder die Wahrheit hören können?", optionA: 'Nie wieder lügen', optionB: 'Nie wieder Wahrheit hören'},
            { id: 'dilemma-49', text: "Würdest du lieber von allen gehasst, aber reich sein, oder von allen geliebt, aber arm sein?", optionA: 'Gehasst und reich', optionB: 'Geliebt und arm'},
            { id: 'dilemma-50', text: "Würdest du auf deine Träume verzichten, um die Träume deiner Familie zu erfüllen?", optionA: 'Ja', optionB: 'Nein'},
        ]
    }
];
