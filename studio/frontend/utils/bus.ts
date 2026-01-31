import mitt from 'mitt';

type Events = {
    'editor-add-tab': {
        filename: string;
    };
};

const bus = mitt<Events>();

export default bus;